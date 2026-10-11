import { expect, test } from '@playwright/test'

test.describe('permission flow', () => {
  test('Alice → Bob hides Leadership, then status change toasts', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Backlog' })).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'Workspace tree' }).getByText('Leadership'),
    ).toBeVisible()

    await page.getByRole('button', { name: /Current user Alice/i }).click()
    await page.getByRole('menuitem', { name: /Bob/i }).click()

    await expect(
      page.getByText(/Viewing as Bob/i),
    ).toBeVisible({ timeout: 10_000 })

    const tree = page.getByRole('navigation', { name: 'Workspace tree' })
    await expect(tree.getByText('Leadership')).toHaveCount(0)
    await expect(tree.getByText('Backlog')).toBeVisible()

    await tree.getByText('Backlog').click()
    await expect(page.getByRole('heading', { name: 'Backlog' })).toBeVisible()

    await page.getByText('Audit tree permission edges').click()
    await expect(page.getByLabel('Task title')).toHaveValue(
      'Audit tree permission edges',
    )

    await page.getByRole('button', { name: 'Change status' }).click()
    await page.getByRole('menuitem', { name: /In progress/i }).click()

    await expect(page.getByText(/Moved to In progress/i)).toBeVisible({
      timeout: 10_000,
    })
  })
})
