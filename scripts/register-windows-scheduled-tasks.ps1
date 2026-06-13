param(
  [string]$ProjectPath = (Resolve-Path ".").Path,
  [string]$NodePackageCommand = "npm.cmd"
)

$netWorthTaskName = "MuskTracker-NetWorth-6Hourly"
$marketTaskName = "MuskTracker-MarketValues-AfterClose"

$netWorthAction = New-ScheduledTaskAction `
  -Execute $NodePackageCommand `
  -Argument "run update:net-worth" `
  -WorkingDirectory $ProjectPath

$marketAction = New-ScheduledTaskAction `
  -Execute $NodePackageCommand `
  -Argument "run update:market" `
  -WorkingDirectory $ProjectPath

$netWorthTrigger = New-ScheduledTaskTrigger `
  -Once `
  -At 12:00am `
  -RepetitionInterval (New-TimeSpan -Hours 6) `
  -RepetitionDuration ([TimeSpan]::MaxValue)

$marketTrigger = New-ScheduledTaskTrigger `
  -Weekly `
  -DaysOfWeek Monday, Tuesday, Wednesday, Thursday, Friday `
  -At 11:30pm

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable

Register-ScheduledTask `
  -TaskName $netWorthTaskName `
  -Action $netWorthAction `
  -Trigger $netWorthTrigger `
  -Settings $settings `
  -Description "Refresh Musk Tracker net worth data every 6 hours." `
  -Force

Register-ScheduledTask `
  -TaskName $marketTaskName `
  -Action $marketAction `
  -Trigger $marketTrigger `
  -Settings $settings `
  -Description "Refresh Musk Tracker public stock/market values after market close on weekdays." `
  -Force

Write-Host "Registered scheduled tasks:"
Write-Host "- $netWorthTaskName: every 6 hours"
Write-Host "- $marketTaskName: weekdays at 11:30 PM local time, after the regular US market close"
