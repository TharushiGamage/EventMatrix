import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/feed');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address *' }).click();
  await page.getByRole('textbox', { name: 'Email Address *' }).fill('dushan@gmail.com');
  await page.getByRole('textbox', { name: 'Password *' }).click();
  await page.getByRole('textbox', { name: 'Password *' }).fill('dushan@123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('img', { name: 'IEEE Day' }).click();
  await page.getByRole('button', { name: 'Register for this Event' }).click();
  await page.getByRole('textbox', { name: 'e.g. +' }).click();
  await page.getByRole('textbox', { name: 'e.g. +' }).fill('0701891869');
  await page.getByRole('textbox', { name: 'e.g. Faculty of Computing' }).click();
  await page.getByRole('textbox', { name: 'e.g. Faculty of Computing' }).fill('Faculty of Computing');
  await page.getByRole('combobox').selectOption('Normal');
  await page.getByRole('button', { name: 'Continue to Payment →' }).click();
  
  // Start waiting for the file chooser dialog BEFORE clicking
  const fileChooserPromise = page.waitForEvent('filechooser');
  
  // Click the element that triggers the upload dialog
  await page.getByText('Click to upload receipt').click();
  
  // Catch the dialog and set the file
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('1.png'); // Ensure '1.png' is in your project root folder
  
  await page.getByRole('button', { name: 'Confirm Payment' }).click();
  await page.getByRole('button', { name: 'View My Registrations' }).click();
  await page.getByRole('button', { name: /Notifications/ }).click();
  await page.getByText('You have successfully').first().click();
  await page.getByText('Dushan Perera').click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('textbox', { name: 'Email Address *' }).click();
  await page.getByRole('textbox', { name: 'Email Address *' }).fill('organizer@gmail.com');
  await page.getByRole('textbox', { name: 'Password *' }).click();
  await page.getByRole('textbox', { name: 'Password *' }).fill('org@123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: /Notifications/ }).click();
  await page.getByText('Dushan Perera has submitted').first().click();
  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('link', { name: 'Overview' }).click();
  await page.getByText('1Pending PaymentsStudent').click();
  await page.getByRole('button', { name: '✓ Approve' }).click();
  await page.getByRole('link', { name: 'Overview' }).click();
  await page.getByText('3Approved PaymentsApproved').click();
  await page.getByRole('button', { name: /Notifications/ }).click();
  await page.getByRole('button', { name: /Notifications/ }).click();
  await page.getByText('Organizer Test').click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('textbox', { name: 'Email Address *' }).click();
  await page.getByRole('textbox', { name: 'Email Address *' }).fill('dushan@gmail.com');
  await page.getByRole('textbox', { name: 'Password *' }).click();
  await page.getByRole('textbox', { name: 'Password *' }).fill('dushan@123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: /Notifications/ }).click();
  await page.getByText('Your payment for "IEEE Day"').first().click();
  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('link', { name: 'My Registrations' }).click();
  await page.getByRole('button', { name: 'View QR Code' }).first().click();
  
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download QR Code' }).click();
  const download = await downloadPromise;
  
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByText('Dushan Perera').click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('textbox', { name: 'Email Address *' }).click();
  await page.getByRole('textbox', { name: 'Email Address *' }).fill('organizer@gmail.com');
  await page.getByRole('textbox', { name: 'Password *' }).click();
  await page.getByRole('textbox', { name: 'Password *' }).fill('org@123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: /Notifications/ }).click();
  await page.getByRole('button', { name: /Notifications/ }).click();
  await page.getByRole('link', { name: 'Profile' }).click();
  
  await page.getByRole('link', { name: 'Scan Ticket QR' }).click();
  await page.getByRole('button', { name: 'Scan with Camera' }).click();
  await page.getByText('Scan an Image File').click();
  
  const qrFileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose Image - No image' }).click();
  const qrFileChooser = await qrFileChooserPromise;
  await qrFileChooser.setFiles('Screenshot (48).png');
  
  await page.getByRole('button', { name: /Notifications/ }).click();
  await page.getByRole('img', { name: 'Avatar' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
});