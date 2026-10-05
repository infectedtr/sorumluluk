@echo off
chcp 65001 > nul
title MEB Sorumluluk Sınavları - Hızlı Lisans Üretici
color 0b

:MENU
cls
echo ================================================================
echo      MEB SORUMLULUK SINAVLARI - YÖNETİCİ LİSANS ÜRETİCİ
echo ================================================================
echo.
echo   [1] Konsoldan Hızlı Lisans Üret
echo   [2] Görsel Lisans Yönetim Panelini Aç (HTML)
echo   [3] Bugüne Kadar Üretilen Lisansları Görüntüle (Metin Dosyası)
echo   [4] Çıkış
echo.
echo ================================================================
set /p SECIM="Lütfen bir işlem seçin (1-4): "

if "%SECIM%"=="1" goto URET
if "%SECIM%"=="2" goto WEB_PANEL
if "%SECIM%"=="3" goto GORUNTULE
if "%SECIM%"=="4" goto CIKIS
goto MENU

:URET
cls
echo ================================================================
echo                     YENİ LİSANS TANIMLAMA
echo ================================================================
echo.
set /p OKUL="1. Okul / Kurum Adı: "
if "%OKUL%"=="" (
    echo Okul adı boş bırakılamaz!
    pause
    goto URET
)

set /p YETKILI="2. Yetkili Kişi (Müdür / İdareci): "
if "%YETKILI%"=="" set YETKILI=Okul İdaresi

set /p EMAIL="3. İletişim / E-posta (İsteğe bağlı): "

cls
echo Lisans Supabase veritabanına kaydediliyor, lütfen bekleyin...
echo.

node scripts/generate-license.cjs "%OKUL%" "%YETKILI%" "%EMAIL%" "Masaüstü Satış"

echo.
echo ================================================================
echo İşlem tamamlandı! Yukarıdaki lisans kodunu müşterinize iletebilirsiniz.
echo ================================================================
echo.
pause
goto MENU

:WEB_PANEL
echo Lisans Yönetim Paneli tarayıcınızda açılıyor...
start "" "%~dp0Lisans_Paneli.html"
goto MENU

:GORUNTULE
if exist "%~dp0URETILEN_LISANSLAR.txt" (
    notepad "%~dp0URETILEN_LISANSLAR.txt"
) else (
    echo Henüz kaydedilmiş yerel lisans dosyası bulunmuyor.
    echo Lisanslar doğrudan Supabase bulut veritabanında saklanmaktadır.
    echo Lisans_Paneli.html dosyasını açarak tüm lisansları görebilirsiniz.
    pause
)
goto MENU

:CIKIS
exit
