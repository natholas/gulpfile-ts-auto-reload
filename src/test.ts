export class Test {
  constructor(public val: string) {
    document.querySelector('#test-status').innerHTML = val
    document.querySelector('#test-status').classList.add('working')
  }
}