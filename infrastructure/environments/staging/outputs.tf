output "web_service_account_role_arn" {
  value = module.web.iam_role_arn
}

output "redirect_distribution_domain_name" {
  value = module.web.redirect_distribution_domain_name
}

output "redirect_distribution_hosted_zone_id" {
  value = module.web.redirect_distribution_hosted_zone_id
}

output "domain_nameservers" {
  description = "Route53 nameservers for the subdomain zone, for the parent-zone NS record."
  value       = aws_route53_zone.domain.name_servers
}