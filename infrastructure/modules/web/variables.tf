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

variable "redirect_domains" {
  description = "Deprecated domains that should redirect to app_urls. Optional."
  type        = list(string)
  default     = []
}

variable "redirect_target" {
  description = "Primary domain that redirect_domains should point to. Defaults to the first app_urls entry."
  type        = string
  default     = null
}

variable "redirect_acm_certificate_arn" {
  description = "ACM certificate covering redirect_domains. Defaults to aws_acm_certificate_arn."
  type        = string
  default     = null
}
