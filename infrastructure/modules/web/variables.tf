variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "app_urls" {
  type = list(string)
}

variable "repo_name" {
  type = string

  validation {
    condition     = can(regex("^[^/]+/[^/]+$", var.repo_name))
    error_message = "repo_name must be in the form owner/repository."
  }
}

variable "repo_owner_id" {
  type = string
}

variable "repo_id" {
  type = string
}

variable "github_environment" {
  type = string
}


variable "aws_acm_certificate_arn" {
  type = string
}
