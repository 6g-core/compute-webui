param(
  [string]$Source = (Get-ChildItem -LiteralPath (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) -Filter '*.pptx' | Select-Object -First 1).FullName
)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
$referenceDir = Join-Path $projectDir '.reference'
New-Item -ItemType Directory -Force -Path $referenceDir | Out-Null
$pptApp = New-Object -ComObject PowerPoint.Application
try {
  $deck = $pptApp.Presentations.Open($Source, -1, 0, 0)
  $slide = $deck.Slides.Item(1)
  $slide.Export((Join-Path $referenceDir 'ppt-original.png'), 'PNG', 3840, 2160)
  $deck.SaveAs((Join-Path $referenceDir 'ppt-original.pdf'), 32)
  # Remove only the placeholder group; preserve every other source object.
  # Changes are in memory. The source PPTX is never saved.
  for ($shapeIndex = $slide.Shapes.Count; $shapeIndex -ge 1; $shapeIndex--) {
    if ($slide.Shapes.Item($shapeIndex).Id -eq 75) {
      $slide.Shapes.Item($shapeIndex).Delete()
    }
  }
  $deck.SaveAs((Join-Path $referenceDir 'ppt-template.pdf'), 32)
  $slide.Export((Join-Path $referenceDir 'ppt-template.png'), 'PNG', 3840, 2160)
  function Hide-ShapeText($shape) {
    if ($shape.Type -eq 6) {
      for ($childIndex = 1; $childIndex -le $shape.GroupItems.Count; $childIndex++) {
        Hide-ShapeText $shape.GroupItems.Item($childIndex)
      }
    } elseif ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
      $shape.TextFrame2.TextRange.Font.Fill.Transparency = 1
    }
  }
  for ($shapeIndex = 1; $shapeIndex -le $slide.Shapes.Count; $shapeIndex++) {
    Hide-ShapeText $slide.Shapes.Item($shapeIndex)
  }
  $slide.Export((Join-Path $referenceDir 'ppt-artwork.png'), 'PNG', 3840, 2160)
  $deck.Close()
  Write-Output 'Exported original reference and presentation template.'
} finally {
  $pptApp.Quit()
}
