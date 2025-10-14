
variable "aws_region" {
  description = "AWS region for the deployment"
  type        = string
  default     = "ap-southeast-2"
}

variable "environment" {
  description = "Deployment environment ({developer-name}, test, staging, prod)"
  type        = string
}

variable "bucket_domain_name" {
  description = "the domain name used for the s3 bucket name"
  type        = string
  default     = "yumdao.org"
}

variable "bucket_subdomain_name" {
  description = "the subdomain name used for the s3 bucket name"
  type        = string
  default     = "test."
}

variable "project_name" {
  description = "The project/component name"
  type        = string
  default     = "yumdao"
}



