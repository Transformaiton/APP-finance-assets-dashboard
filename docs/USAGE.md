# Usage guide

Finance & Assets Dashboard by [Transformaiton.com](https://transformaiton.com/) is a manual ledger. You decide the balances. The public app opens with an invented studio portfolio (Harborview Checking, Northwind Savings, Lumen Rewards Card, and the other sample accounts) so the screens are full the first time you open them.

Nothing in the demo is a real bank, card, or customer.

## What you can do

- See net worth, assets, and debt in one row.
- Filter accounts by type and read the filtered total.
- Select any mix of accounts and limit the grid and the spending report to that mix.
- Drag account cards to change their order.
- Choose 1 to 6 cards per row on a wide screen.
- Record money in or money out, with a category and a note.
- Read per-account history.
- Add your own categories.
- Store an annual yield (APY) and post one month of estimated interest.
- Reset back to the fictional demo, or clear the browser and start from an empty portfolio.

## First visit

1. Start the app with the steps in [INSTALL.md](INSTALL.md).
2. Open http://localhost:3000.
3. Read the amber banner. It should say the portfolio is fictional.
4. Check the four totals at the top. Debt is the credit-card balances, shown as a negative number. Net worth is assets minus that debt.
5. Scroll to **Spending report**. The sample lines are notes that start with "Demo:". The red **Spent** figure counts money out only. Income and interest stay in the list in green and are not added to Spent.

Your edits from this moment are saved in this browser only. Another computer, another browser, or a private window will not see them.

## Record an activity

1. On an account card, click **+ Activity**.
2. Choose **Income +** or **Expense −**.
3. Enter an amount. Use a positive number either way. The button decides the sign.
4. Pick a category and, if you want, a short note.
5. Click **Save activity**.

The account balance updates immediately and the new line appears in **Spending report** and in **History**.

Example: Paperplane Card, Expense, 18.00, category Software, note "Demo: domain renewal". The card balance becomes more negative by $18.00.

## Add or edit an account

1. Click **+ Add account**, or **Edit** on an existing card.
2. Name the account in plain language. Do not put a full account number, card number, or routing number in the name.
3. Choose a type: Banks, Credit Cards, Crypto, Cash, Investments, Gift Cards, Gold & Silver, or Other.
4. Enter the current balance. For a credit card, enter what you owe as a negative number, for example `-420.18`.
5. Optional: enter APY, the annual yield percent, for a savings or cash account that earns interest.
6. Click **Save account**.

A yield above zero shows an estimated monthly amount on the card: balance × APY ÷ 12. **Add estimated monthly interest** posts that amount as an Interest activity and increases the balance. It is an estimate you choose to record. It does not come from a bank.

## Review one account

Click **History** on a card. The dialog lists every activity recorded for that account, newest first, with the date, category, note, and amount. Close it with the × button or by clicking the dark area around the dialog.

Deleting an account removes the card. Activities already recorded keep their account name and can still appear in the spending report.

## Filter, select, and reorder

**Type filters.** The chips under the portfolio mix (All, Banks, Credit Cards, and the rest) hide cards that are a different type. The dark **Filtered total** follows what is on screen.

**Select.** The checkbox on a card limits the grid and the spending report to the accounts you tick. Tick two cards to report on only those two. Tick a card again to deselect it. The type filter and the selection both apply.

**Reorder.** Drag a card by its body and drop it on another card. The new order is saved in this browser.

**Density.** On a wide window, the **Tiles per row** slider sets 1 to 6 columns. Narrow windows stack the cards for readability, even if the slider is higher.

## Spending report

The report sits at the bottom of the page.

- **Period** limits lines to the last day, last week, last 30 days, or all time.
- **Category** limits lines to one category. **Manage categories** adds or removes names. Removing a name does not delete activities that already used it.
- **Spent** is the sum of negative amounts in the current period, category, and selection. Money in is listed, and it is not included in Spent.
- The list shows up to 12 matching lines. Older matches still count toward Spent.

The sample data includes one office receipt dated 45 days ago. Choose **All time** to see it. **Last 30 days** leaves it out. That is a useful check that the period filter is working.

## Use your own figures

1. Click **Clear saved data** and confirm. The portfolio becomes empty. Categories you already had remain.
2. Click **+ Add account** and enter the balances you want to track.
3. Record activity as it happens.

Or keep the demo and edit individual cards with **Edit**.

**Reset demo data** deletes those edits in this browser and loads the fictional portfolio again. Confirm only when you mean to discard what you typed.

## What this app does not do

- It does not connect to a bank, card network, or payroll system.
- It does not sync between devices or between people.
- It does not file taxes or calculate a legally binding interest payment.
- It does not send the numbers you type to Transformaiton.com.

Treat the screen as a private worksheet on that device. On a shared computer, clear the site data when you are done (the browser's settings for localhost, or **Clear saved data**).

## Privacy habits

- Keep real account numbers out of names and notes. A nickname such as "Operating checking" is enough.
- Do not commit a customized `app/demo-data.js` that contains real balances if the repository is public.
- Screenshots of a real portfolio are still financial information. Crop them before you send them.

## Contact

Need a hand, or want this connected to the rest of your tools? Write to [info@transformaiton.com](mailto:info@transformaiton.com) or visit [transformaiton.com](https://transformaiton.com/).
