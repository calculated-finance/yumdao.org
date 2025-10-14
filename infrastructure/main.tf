terraform {
  required_version = ">= 1.0, < 2.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~>4.9"
    }
  }
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}



















