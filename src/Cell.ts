import U from "./UiClass";

class Cell{

  obj: any;
  x : number;
  y : number;
  element : HTMLElement;
  ball : HTMLElement;
  state: any;
  ballClick: Function;
  cellHover: Function;
  cellClick: Function;

  constructor(_y: number, _x: number, _val: any, _state: any, _ballClick: Function, _cellHover: Function, _cellClick: Function){
    this.x = _x;
    this.y = _y;
    this.obj = _val;
    this.state = _state;
    this.ballClick = _ballClick;
    this.cellHover = _cellHover;
    this.cellClick = _cellClick;
    this.render()
  }

  render(){
    this.element = U.el("div");
    this.element.classList.add("Cell");
    this.element.addEventListener("mouseenter", () => {
      this.cellHover(this);
    })
    this.element.addEventListener("click", () => {
      this.cellClick(this);
    })
    this.element.style.backgroundColor = this.obj.background;
    if(this.obj.val != "null" && this.obj.val != "path" && this.obj.val != "oldPath"){
      this.ball = U.el('div');
      this.ball.classList.add("Ball");
      this.ball.style.backgroundColor = U.colors[parseInt(this.obj.val)];
      this.ball.addEventListener('click', () => {
        this.ballClick(this);
      })
      if(this.state.selected.x == this.x && this.state.selected.y == this.y){
        this.ball.style.transform = 'scale(1.2)';
      }
      this.element.appendChild(this.ball);
    }
  }
}

export default Cell;