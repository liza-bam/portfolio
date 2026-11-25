# Renders the printed case studies to PDFs in the folder above (landscape Letter).
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

HERE = Path(__file__).resolve().parent
CASES = {"bp-case.html": "Sandy_Tayts_BP_Case_Study.pdf",
         "ey-case.html": "Sandy_Tayts_EY_Case_Study.pdf"}


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        for html, pdf in CASES.items():
            await page.goto((HERE / html).as_uri(), wait_until="networkidle")
            await page.pdf(path=str(HERE.parent / pdf),
                           prefer_css_page_size=True, print_background=True)
        await browser.close()

asyncio.run(main())
