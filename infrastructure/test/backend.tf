terraform {
  backend "s3" {
    bucket         = "tf-state-ap-southeast-2-503097572706"
    key            = "terraform/infrastructure/test/yumdao"
    region         = "ap-southeast-2"
    dynamodb_table = "terraform-state-locks"
  }
}
