const globalContext = {
  one: 1,
  two: 2,
  three: 'hi',
}
type context = typeof globalContext

type PickContext<T extends keyof context> = Pick<context, T>

function createTask<T>(task: (subcontext: T) => void) {
  return (scopedContext: T) => {
    task(scopedContext)
  }
}

const task2 = createTask<PickContext<'three'>>((subcontext) => {
  console.log(subcontext.three)
  console.log(subcontext.one)
})

const task3 = createTask<PickContext<'two'>>((subcontext) => {
  console.log(subcontext.two)
})

const task1 = createTask<PickContext<'one' | 'three'>>((subcontext) => {
  console.log(subcontext.one)
  console.log(subcontext.three)
  task2(subcontext)
  task3(subcontext)
})

task1(globalContext)
task3(globalContext)
