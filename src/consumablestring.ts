export class ConsumableString {
    str: string;
    slice: string;
    constructor(str: string) {
      this.str = str;
      this.slice = "";
    }
  
    consumeStart(amount: number) {
      this.slice = this.str.slice(0, amount);
      this.str = this.str.slice(amount);
      return this;
    }
  
    trimSliceEnd(char: string) {
      this.slice = removeFromEnd(this.slice, char);
      return this;
    }
  
    get() {
      return this.slice;
    }
  
    parsed() {
      return !this.str.length
    }
}

export function removeFromEnd(str: string, char: string) {
    let lastIndex = str.length;
    for(let i = lastIndex - 1; i >= 0; i--) {
        if(str[i] !== char) break;
        lastIndex = i;
    }
    return str.slice(0, lastIndex);
}