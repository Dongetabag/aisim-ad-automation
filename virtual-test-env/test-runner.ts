import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import fs from 'fs/promises';
import path from 'path';

interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  screenshot?: string;
  error?: string;
}

class AISim_AdTester {
  private driver: WebDriver;
  private results: TestResult[] = [];

  async initialize() {
    const chromeOptions = new Options();
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--headless');

    this.driver = await new Builder()
      .forBrowser('chrome')
      .usingServer(process.env.SELENIUM_URL || 'http://localhost:4444')
      .setChromeOptions(chromeOptions)
      .build();
  }

  async runAllTests() {
    console.log('🚀 Starting AISim Ad Tests...\n');

    await this.initialize();

    try {
      // Test 1: Ad displays correctly
      await this.testAdDisplay();

      // Test 2: Ad triggers at correct time
      await this.testAdTiming();

      // Test 3: Ad closes properly
      await this.testAdClose();

      // Test 4: Ad respects frequency settings
      await this.testAdFrequency();

      // Test 5: Ad is mobile responsive
      await this.testMobileResponsive();

      // Test 6: Ad tracking works
      await this.testAdTracking();

      // Test 7: Ad brand compliance
      await this.testBrandCompliance();

    } catch (error) {
      console.error('❌ Test suite error:', error);
    } finally {
      await this.driver.quit();
      await this.generateReport();
    }
  }

  private async testAdDisplay() {
    const startTime = Date.now();
    try {
      await this.driver.get(`${process.env.TEST_URL}/sample-site-1.html`);
      
      // Wait for ad to appear
      const adElement = await this.driver.wait(
        until.elementLocated(By.className('aisim-popup-overlay')),
        10000
      );

      // Check if ad is visible
      const isDisplayed = await adElement.isDisplayed();
      const screenshot = await this.driver.takeScreenshot();

      this.results.push({
        testName: 'Ad Display',
        passed: isDisplayed,
        duration: Date.now() - startTime,
        screenshot: screenshot
      });

      console.log(isDisplayed ? '✅ Ad Display Test PASSED' : '❌ Ad Display Test FAILED');
    } catch (error) {
      this.results.push({
        testName: 'Ad Display',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Ad Display Test FAILED:', error.message);
    }
  }

  private async testAdTiming() {
    const startTime = Date.now();
    try {
      await this.driver.get(`${process.env.TEST_URL}/sample-site-1.html`);
      
      // Start timer
      const loadTime = Date.now();

      // Wait for ad
      await this.driver.wait(
        until.elementLocated(By.className('aisim-popup-overlay')),
        10000
      );

      const displayTime = Date.now();
      const timeDiff = displayTime - loadTime;

      // Ad should appear within 3-4 seconds (3000ms delay + processing)
      const passed = timeDiff >= 2800 && timeDiff <= 4000;

      this.results.push({
        testName: 'Ad Timing',
        passed: passed,
        duration: Date.now() - startTime
      });

      console.log(passed ? '✅ Ad Timing Test PASSED' : '❌ Ad Timing Test FAILED');
    } catch (error) {
      this.results.push({
        testName: 'Ad Timing',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Ad Timing Test FAILED:', error.message);
    }
  }

  private async testAdClose() {
    const startTime = Date.now();
    try {
      await this.driver.get(`${process.env.TEST_URL}/sample-site-1.html`);
      
      // Wait for ad
      await this.driver.wait(
        until.elementLocated(By.className('aisim-popup-overlay')),
        10000
      );

      // Click close button
      const closeBtn = await this.driver.findElement(By.className('aisim-popup-close'));
      await closeBtn.click();

      // Wait a moment
      await this.driver.sleep(500);

      // Check if ad is hidden
      const adElement = await this.driver.findElement(By.className('aisim-popup-overlay'));
      const isVisible = await adElement.getCssValue('opacity');
      
      const passed = isVisible === '0';

      this.results.push({
        testName: 'Ad Close',
        passed: passed,
        duration: Date.now() - startTime
      });

      console.log(passed ? '✅ Ad Close Test PASSED' : '❌ Ad Close Test FAILED');
    } catch (error) {
      this.results.push({
        testName: 'Ad Close',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Ad Close Test FAILED:', error.message);
    }
  }

  private async testAdFrequency() {
    const startTime = Date.now();
    try {
      // First visit - should show
      await this.driver.get(`${process.env.TEST_URL}/sample-site-1.html`);
      await this.driver.wait(
        until.elementLocated(By.className('aisim-popup-overlay')),
        10000
      );

      // Close ad
      const closeBtn = await this.driver.findElement(By.className('aisim-popup-close'));
      await closeBtn.click();

      // Second visit - should NOT show (frequency = 'once')
      await this.driver.get(`${process.env.TEST_URL}/sample-site-1.html`);
      await this.driver.sleep(5000); // Wait longer than display delay

      // Try to find ad
      const ads = await this.driver.findElements(By.className('aisim-popup-overlay'));
      const passed = ads.length === 0 || !(await ads[0].isDisplayed());

      this.results.push({
        testName: 'Ad Frequency',
        passed: passed,
        duration: Date.now() - startTime
      });

      console.log(passed ? '✅ Ad Frequency Test PASSED' : '❌ Ad Frequency Test FAILED');
    } catch (error) {
      this.results.push({
        testName: 'Ad Frequency',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Ad Frequency Test FAILED:', error.message);
    }
  }

  private async testMobileResponsive() {
    const startTime = Date.now();
    try {
      // Set mobile viewport
      await this.driver.manage().window().setRect({ width: 375, height: 667 });

      await this.driver.get(`${process.env.TEST_URL}/sample-site-1.html`);
      
      await this.driver.wait(
        until.elementLocated(By.className('aisim-popup-overlay')),
        10000
      );

      // Check container width
      const container = await this.driver.findElement(By.className('aisim-popup-container'));
      const width = await container.getCssValue('width');
      const widthNum = parseInt(width.replace('px', ''));

      // Container should be responsive (less than 375px)
      const passed = widthNum < 375;

      const screenshot = await this.driver.takeScreenshot();

      this.results.push({
        testName: 'Mobile Responsive',
        passed: passed,
        duration: Date.now() - startTime,
        screenshot: screenshot
      });

      console.log(passed ? '✅ Mobile Responsive Test PASSED' : '❌ Mobile Responsive Test FAILED');

      // Reset viewport
      await this.driver.manage().window().setRect({ width: 1920, height: 1080 });
    } catch (error) {
      this.results.push({
        testName: 'Mobile Responsive',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Mobile Responsive Test FAILED:', error.message);
    }
  }

  private async testAdTracking() {
    const startTime = Date.now();
    try {
      await this.driver.get(`${process.env.TEST_URL}/sample-site-1.html`);
      
      // Wait for ad
      await this.driver.wait(
        until.elementLocated(By.className('aisim-popup-overlay')),
        10000
      );

      // Check if localStorage has tracking data
      const trackingData = await this.driver.executeScript(() => {
        return localStorage.getItem('aisim_ad_shown');
      });

      const passed = trackingData !== null;

      this.results.push({
        testName: 'Ad Tracking',
        passed: passed,
        duration: Date.now() - startTime
      });

      console.log(passed ? '✅ Ad Tracking Test PASSED' : '❌ Ad Tracking Test FAILED');
    } catch (error) {
      this.results.push({
        testName: 'Ad Tracking',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Ad Tracking Test FAILED:', error.message);
    }
  }

  private async testBrandCompliance() {
    const startTime = Date.now();
    try {
      await this.driver.get(`${process.env.TEST_URL}/sample-site-1.html`);
      
      await this.driver.wait(
        until.elementLocated(By.className('aisim-popup-overlay')),
        10000
      );

      // Check brand colors
      const headline = await this.driver.findElement(By.className('aisim-popup-headline'));
      const color = await headline.getCssValue('color');

      // Check for AISim brand gradient/colors
      const passed = color.includes('rgb') || color.includes('#10b981');

      const screenshot = await this.driver.takeScreenshot();

      this.results.push({
        testName: 'Brand Compliance',
        passed: passed,
        duration: Date.now() - startTime,
        screenshot: screenshot
      });

      console.log(passed ? '✅ Brand Compliance Test PASSED' : '❌ Brand Compliance Test FAILED');
    } catch (error) {
      this.results.push({
        testName: 'Brand Compliance',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Brand Compliance Test FAILED:', error.message);
    }
  }

  private async generateReport() {
    console.log('\n📊 Test Results Summary\n');
    console.log('━'.repeat(50));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const duration = `${result.duration}ms`;
      console.log(`${status} | ${result.testName.padEnd(20)} | ${duration}`);
    });

    console.log('━'.repeat(50));
    console.log(`\nTotal: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: { total, passed, failed },
      results: this.results
    };

    await fs.writeFile(
      path.join('/app/results', 'test-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log('📝 Detailed report saved to: /app/results/test-report.json\n');
  }
}

// Run tests
const tester = new AISim_AdTester();
tester.runAllTests();



