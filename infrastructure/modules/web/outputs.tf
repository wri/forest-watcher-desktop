output "iam_role_arn" {
  value = aws_iam_role.ci.arn
}

output "cloudfront_distribution_domain_name" {
  value = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_hosted_zone_id" {
  value = aws_cloudfront_distribution.main.hosted_zone_id
}

output "redirect_distribution_domain_name" {
  description = "CloudFront domain of the redirect distribution, when redirect_domains is set."
  value       = length(local.redirect_domains) > 0 ? aws_cloudfront_distribution.redirect[0].domain_name : null
}

output "redirect_distribution_hosted_zone_id" {
  description = "Hosted zone id of the redirect CloudFront distribution, when redirect_domains is set."
  value       = length(local.redirect_domains) > 0 ? aws_cloudfront_distribution.redirect[0].hosted_zone_id : null
}