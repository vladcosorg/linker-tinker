import { Listr } from 'listr2'
import { beforeEach, expect, test } from 'vitest'

import { createTask } from '../../src/lib/tasks'
import { runRollbackTasks } from '../../src/lib/tasks/run-rollback-tasks'

import type { ListrTask } from 'listr2'

interface TestContext {
  normalTask: ListrTask
  throwingTask: ListrTask
  rollbackTask: ListrTask
  rollbackRan: boolean
}

beforeEach<TestContext>((context) => {
  context.rollbackRan = false
  context.normalTask = createTask(() => ({
    title: 'Simple test',
    task() {
      console.log('Normal task ran')
    },
  }))()

  context.throwingTask = createTask(() => ({
    title: 'Throwing task test',
    task() {
      throw new Error('Foo')
    },
  }))()

  context.rollbackTask = createTask(() => ({
    title: 'This task has a rollback method',
    task() {
      console.log('do something')
    },
    rollback() {
      console.log('set to tru')
      context.rollbackRan = true
    },
  }))()
})

test<TestContext>('Rollback should not run during normal execution', async (context) => {
  try {
    await new Listr([context.rollbackTask, context.normalTask]).run()
  } catch {
    await new Listr([runRollbackTasks()]).run()
  }

  expect(context.rollbackRan).toBe(false)
})

test<TestContext>('Rollback should run when another task in a chain throws', async (context) => {
  const taskContext = {}
  try {
    await new Listr([context.rollbackTask, context.throwingTask]).run(
      taskContext,
    )
  } catch {
    await new Listr([runRollbackTasks()]).run(taskContext)
  }

  expect(context.rollbackRan).toBe(true)
})
