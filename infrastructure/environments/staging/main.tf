terraform {
  backend "s3" {
    bucket = "forest-watcher-web.terraform"
    key    = "staging/terraform.tfstate"
    region = "us-east-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.82.2"
    }
  }
}

locals {
  client       = "wri"
  project_name = "${local.client}-forest-watcher"
  environment  = "staging"
  name         = "${local.project_name}-${local.environment}"
  domain       = "staging-fw.globalforestwatch.org"
  tags = {
    client      = local.client
    product     = local.project_name
    Environment = local.environment
  }
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = local.tags
  }
}

data "aws_acm_certificate" "domain" {
  domain      = local.domain
  statuses    = ["ISSUED"]
  most_recent = true
}

data "aws_route53_zone" "domain_fw" {
  name = local.domain
}

module "web" {
  source = "../../modules/web"

  project_name            = local.project_name
  environment             = local.environment
  app_urls                = [local.domain]
  repo_name               = "forest-watcher/forest-watcher-desktop"
  aws_acm_certificate_arn = data.aws_acm_certificate.domain.arn
}

resource "aws_route53_record" "main" {
  zone_id = data.aws_route53_zone.domain_fw.zone_id
  name    = local.domain
  type    = "A"

  alias {
    name                   = module.web.cloudfront_distribution_domain_name
    zone_id                = module.web.cloudfront_distribution_hosted_zone_id
    evaluate_target_health = false
  }
}
