Add-Type -AssemblyName System.Drawing

function Optimize-Jpeg {
    param(
        [string]$inPath,
        [string]$outPath,
        [int]$maxDim = 1200,
        [int]$quality = 85
    )
    $img = [System.Drawing.Image]::FromFile((Resolve-Path $inPath).Path)
    $w = $img.Width
    $h = $img.Height
    if ($w -gt $maxDim -or $h -gt $maxDim) {
        if ($w -gt $h) {
            $newW = $maxDim
            $newH = [int]($h * ($maxDim / $w))
        } else {
            $newH = $maxDim
            $newW = [int]($w * ($maxDim / $h))
        }
    } else {
        $newW = $w
        $newH = $h
    }
    $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $newW, $newH)
    
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
    
    $fullOut = [System.IO.Path]::GetFullPath($outPath)
    $bmp.Save($fullOut, $codec, $encoderParams)
    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()
    
    Write-Host "Optimized $inPath ($w x $h) -> $outPath ($newW x $newH): $((Get-Item $fullOut).Length) bytes"
}

Optimize-Jpeg "tmp/italian_staging/03_san_carlo_cicchetti.jpg" "tmp/italian_staging/03_san_carlo_cicchetti_opt.jpg" 1200 85
Optimize-Jpeg "tmp/italian_staging/05_olive_garden.jpg" "tmp/italian_staging/05_olive_garden_opt.jpg" 1200 85
Optimize-Jpeg "tmp/italian_staging/06_eataly.jpg" "tmp/italian_staging/06_eataly_opt.jpg" 1200 85
