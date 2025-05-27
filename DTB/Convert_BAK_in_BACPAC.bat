@echo off
SqlPackage.exe ^
  /Action:Export ^
  /SourceConnectionString:"Data Source=DANNY;Initial Catalog=IAMDB;User ID=QA_USER;Password=qa123456789;TrustServerCertificate=True;Encrypt=False" ^
  /TargetFile:"C:\Desarrollo\IAM\DTB\IAMDB.bacpac"
pause
