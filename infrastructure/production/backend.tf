terraform {
  backend "s3" {
    bucket         = "tf-state-ap-southeast-1-443285594116"
    key            = "terraform/infrastructure/production/yumdao"
    region         = "ap-southeast-1"
    dynamodb_table = "terraform-state-locks"
  }
}
