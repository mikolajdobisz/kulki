import U from "./UiClass";
import Cell from "./Cell";
import Msg from "./Msg";

interface Settings {
  addedBallsCount: number,
  colorCount: number
}

class Game{
  element: HTMLElement;
  info: HTMLElement;
  root: Node;
  map: Array<Array<any>> = new Array();
  pathMap: Array<Array<string>>;
  colors: Array<number> = new Array();
  score: number = 0;
  state: any = {
    selected: {x: null, y: null},
    hovering: {x: null, y: null},
  };
  paused : boolean = false;
  gameOver: boolean = false;
  settings: Settings = {
    addedBallsCount: 3,
    colorCount: 7, //max 7
  }

  constructor(){
    this.root = U.q('#root');
    this.createMap();
    this.render();
    console.log(this);
    const restartButton = U.q("#restart");
    restartButton.addEventListener("click", this.restart)
  }

  restart = () : void => {
    this.gameOver = false;
    this.score = 0;
    this.createMap();
    this.render();
  }

  createMap() : void {
    for(let y : number = 0; y < 9; y++){
      this.map[y] = new Array();
      for(let x : number = 0; x < 9; x++){
        this.map[y][x] = {val: "null", background: "white"};
      }
    }
    this.genRandomColors();
    this.addRandomBalls();
  }

  createElementMap() : void{
    this.map.forEach((subArr, y) => {
      subArr.forEach((el, x) => {
        const cell = new Cell(y, x, el, this.state, this.ballClick, this.cellHover, this.cellClick);
        this.element.appendChild(cell.element);
      })
    });
  }

  renderInfo() : void{
    if(this.info) this.info.parentElement.removeChild(this.info);
    delete this.info;
    this.info = U.el('div');
    this.info.classList.add('info');
    let colorInfo : HTMLElement = U.el('div');
    colorInfo.classList.add('colorInfo');
    this.colors.forEach(el => {
      let colorInfoEl : HTMLElement = U.el('div');
      colorInfoEl.classList.add('colorInfoEl');
      colorInfoEl.style.backgroundColor = U.colors[el];
      colorInfo.appendChild(colorInfoEl);
    });
    this.info.appendChild(colorInfo);
    let scoreInfo : HTMLElement = U.el('div');
    scoreInfo.classList.add('scoreInfo');
    scoreInfo.innerHTML = "score: " + String(this.score);
    this.info.appendChild(scoreInfo);
    this.root.appendChild(this.info);
  }

  render() : void{
    //usuwanie starego elementu
    if(this.element) this.element.parentElement.removeChild(this.element);
    delete this.element;
    //tworzenie nowego elementu
    this.element = U.el('div');
    this.element.classList.add('game_board');
    this.createElementMap();

    //dodanie elementu do wrappera
    this.root.appendChild(this.element);
    //renderowanie elementu info
    this.renderInfo();
    //logowanie mapy
  }

  addRandomBalls() : void{
    let freeSpace : number = 0;
    for(let y : number = 0; y < 9; y ++){
      for(let x : number = 0; x < 9; x ++){
        if(this.map[y][x].val == "null"){
          freeSpace++;
        }
      }
    }
    if(freeSpace > this.settings.addedBallsCount){
      const setBall = (i: number) : void =>{
        let randomY : number = Math.floor(Math.random() * 9);
        let randomX : number = Math.floor(Math.random() * 9);
        if(this.map[randomY][randomX].val == "null"){
          this.map[randomY][randomX].val = String(this.colors[i]);
        }
        else{
          setBall(i)
        }
      }
      for(let i : number = 0; i < this.settings.addedBallsCount; i++){
        setBall(i);
      }
      this.genRandomColors();
    }
    else{
      this.gameOver = true;
      //alert("Game Over")
      const msg = new Msg(`Game over! <br/> Your final score is ${this.score}`);
    }
  }

  genRandomColors() : void{
    for(let i : number = 0; i < this.settings.addedBallsCount; i++){
      this.colors[i] = Math.floor(Math.random() * this.settings.colorCount);
    }
  }

  //resety

  clearPaths() : void{
    this.map.forEach((arr, y) => {
      arr.forEach((el, x) => {
        if(el.val == "path" || el.val == "oldPath"){
          this.map[y][x].val = "null";
        }
      })
    });
    this.resetColors()
  }

  resetState = () : void => {
    this.state = {
      selected: {x: null, y: null},
      hovering: {x: null, y: null},
    }
  }

  resetColors = () : void => {
    for(let y : number = 0; y < 9; y ++){
      for(let x : number = 0; x < 9; x ++){
        this.map[y][x].background = "white";
      }
    }
  }

  //eventy pól
  ballClick = (cell: Cell) : void => {
    if(!this.paused && !this.gameOver){
      if(this.state.selected.y != cell.y || this.state.selected.x != cell.x){
        this.state.selected = {y: cell.y, x: cell.x};
        this.clearPaths();
        this.createPathMap()
        this.render();
      }
      else{
        this.resetState();
        this.clearPaths();
        this.render();
      }
    }
  }

  cellHover = (cell: Cell) : void => {
    if(!this.paused && !this.gameOver){
      if(this.state.selected.y != null && this.state.selected.x != null){
        if(this.state.hovering.y != cell.y || this.state.hovering.x != cell.x){
          if(this.map[cell.y][cell.x].val == "null" || this.map[cell.y][cell.x].val == "path"){
            this.clearPaths()
            this.state.hovering = {y: cell.y, x: cell.x};
            const path = this.findPath();
            path.forEach(el => {
              if(this.map[el.y][el.x].val == "null"){
                this.map[el.y][el.x].val = "path";
                this.map[el.y][el.x].background = U.pathHoverColor;
              }
              else{
                this.map[el.y][el.x].background = U.pathHoverColor;
              }
            })
            
            this.render()
          }
        } 
      }
    }
  }

  cellClick = (cell: Cell) : void => {
    if(!this.paused && !this.gameOver){
      const {hovering, selected} = this.state
      const {map} = this;
      if(map[cell.y][cell.x].val == "path"){
        map[cell.y][cell.x].val = map[selected.y][selected.x].val;
        map[cell.y][cell.x].background = U.pathBallMoveColor;
        map[selected.y][selected.x].val = "path";
        map[selected.y][selected.x].background = U.pathBallMoveColor;
        this.nextRound();
      }
    }
  }

  //zakończenie rundy

  nextRound() : void{
    this.paused = true;
    this.resetState();
    for(let y : number = 0; y < 9; y ++){
      for(let x : number = 0; x < 9; x ++){
        if(this.map[y][x].val == "path"){
          this.map[y][x].val = "oldPath";
          this.map[y][x].background = U.pathBallMoveColor;
        }
      }
    }
    this.render();
    setTimeout(() => {
      this.clearPaths();
      this.check()
      this.addRandomBalls();
      this.check()
      this.render();
      this.paused = false;
    }, 750)
  }

  //szukanie ścieżki

  findPath() : Array<any>{
    let paths : Array<any> = [
      [{y: this.state.selected.y, x: this.state.selected.x}]
    ];
    const {pathMap} = this;

    let finalPath : Array<any> = [];
    let current : number = 1;
    const rec = () => {
      let end : boolean = true;
      paths.forEach(pathEl => {
        let y : number = pathEl[pathEl.length - 1].y;
        let x : number = pathEl[pathEl.length - 1].x;
        for(let i : number = 0; i < 4; i++){
          let path : Array<any> = [...pathEl];
          if(i == 0 && this.doesCellExist(y - 1, x)){
            if(pathMap[y - 1][x] == String(current)){
              path.push({y: y - 1, x: x})
              paths.push(path)
              end = false;
              if(this.state.hovering.y == y - 1 && this.state.hovering.x == x){
                finalPath = path;
                end = true;
              }
            }
          }
          else if(i == 1 && this.doesCellExist(y, x + 1)){
            if(pathMap[y][x + 1] == String(current)){
              path.push({y: y, x: x + 1})
              paths.push(path)
              end = false;
              if(this.state.hovering.y == y && this.state.hovering.x == x + 1){
                finalPath = path;
                end = true;
              }
            }
          }
          else if(i == 2 && this.doesCellExist(y + 1, x)){
            if(pathMap[y + 1][x] == String(current)){
              path.push({y: y + 1, x: x})
              paths.push(path)
              end = false;
              if(this.state.hovering.y == y + 1 && this.state.hovering.x == x){
                finalPath = path;
                end = true;
              }
            }
          }
          else if(i == 3 && this.doesCellExist(y, x - 1)){
            if(pathMap[y][x - 1] == String(current)){
              path.push({y: y, x: x - 1})
              paths.push(path)
              end = false;
              if(this.state.hovering.y == y && this.state.hovering.x == x - 1){
                finalPath = path;
                end = true;
              }
            }
          }
        }
      })
      current++;
      if(!end){
        rec()
      }
    }
    rec()
    return finalPath
  }

  createPathMap() : void{
    const {selected} = this.state;
    const {map} = this;
    const pathMap: Array<Array<any>> = new Array();
    
    for(let y : number = 0; y < 9; y++){
      pathMap[y] = new Array();
      for(let x : number = 0; x < 9; x++){
        if(map[y][x].val != "null"){
          pathMap[y][x] = "ball"
        }
        else{
          pathMap[y][x] = "null"
        }
      }
    }

    pathMap[selected.y][selected.x] = '0';
    let ended : boolean = false;
    let current : number = 0;
    while(ended == false){
      ended = true;
      for(let y : number = 0; y < 9; y ++){
        for(let x : number = 0; x < 9; x ++){
          if(pathMap[y][x] == String(current)){
            ended = false;
            for(let i : number = 0; i < 4; i++){
              if(i == 0 && this.doesCellExist(y - 1, x)){
                if(pathMap[y - 1][x] == "null"){
                  pathMap[y - 1][x] = String(current + 1)
                }
              }
              else if(i == 1 && this.doesCellExist(y, x + 1)){
                if(pathMap[y][x + 1] == "null"){
                  pathMap[y][x + 1] = String(current + 1)
                }
              }
              else if(i == 2 && this.doesCellExist(y + 1, x)){
                if(pathMap[y + 1][x] == "null"){
                  pathMap[y + 1][x] = String(current + 1)
                }
              }
              else if(i == 3 && this.doesCellExist(y, x - 1)){
                if(pathMap[y][x - 1] == "null"){
                  pathMap[y][x - 1] = String(current + 1)
                }
              }
            }
          }
        }
      }
      current++
    }
    this.pathMap = pathMap;
  }

  doesCellExist(y: number, x: number) : boolean{
    if(y <= 8 && y >= 0 && x <= 8 && x >= 0){
      return true
    }
    return false
  }

  //zbijanie kul

  check() : void{
    const quant : number = 5;
    const {map} = this;
    U.colors.forEach((color, id) => {

      let suma : number = 0;
      let firstX : number = null;
      for(let y : number = 0; y < 9; y++){
        for(let x : number = 0; x < 9; x++){
          if(map[y][x].val == String(id)){
            if(firstX == null){
              firstX = x
            } 
            suma++;
          }
          else{
            if(suma >= quant){
              for(let i : number = 0; i < suma; i++){
                map[y][firstX + i].del = true;
              }
            }
            suma = 0;
            firstX = null;
          }
        }
        if(suma >= quant){
          for(let i : number = 0; i < suma; i++){
            map[y][firstX + i].del = true;
          }
        }
        suma = 0;
        firstX = null;
      }

      suma = 0
      let firstY : number = null;
      for(let x : number = 0; x < 9; x++){
        for(let y : number = 0; y < 9; y++){
          if(map[y][x].val == String(id)){
            if(firstY == null){
              firstY = y
            } 
            suma++;
          }
          else{
            if(suma >= quant){
              for(let i : number = 0; i < suma; i++){
                map[firstY + i][x].del = true;
              }
            }
            suma = 0;
            firstY = null;
          }
        }
        if(suma >= quant){
          for(let i : number = 0; i < suma; i++){
            map[firstY + i][x].del = true;
          }
        }
        suma = 0;
        firstY = null;
      }

      suma = 0
      let first : any = null;
      let startingPoints : Array<any> = [
        {y: 4, x: 0},
        {y: 3, x: 0},
        {y: 2, x: 0},
        {y: 1, x: 0},
        {y: 0, x: 0},
        {y: 0, x: 1},
        {y: 0, x: 2},
        {y: 0, x: 3},
        {y: 0, x: 4},
      ]

      startingPoints.forEach(p => {
        for(let q : number = 0; q < 9; q++){
          let y : number = p.y + q;
          let x : number = p.x + q;
          if(this.doesCellExist(y, x)){
            if(map[y][x].val == id){
              if(!first) first = {y, x};
              suma++;
            }
          }
        }
        if(suma >= quant){
          for(let i : number = 0; i < suma; i++){
            map[first.y + i][first.x + i].del = true;
          }
        }
        suma = 0;
        first = null;
      })

      suma = 0
      first = null;
      startingPoints = [
        {y: 8, x: 4},
        {y: 8, x: 3},
        {y: 8, x: 2},
        {y: 8, x: 1},
        {y: 8, x: 0},
        {y: 7, x: 0},
        {y: 6, x: 0},
        {y: 5, x: 0},
        {y: 4, x: 0},
      ]

      startingPoints.forEach(p => {
        for(let q = 0; q < 9; q++){
          let y : number = p.y - q;
          let x : number = p.x + q;
          if(this.doesCellExist(y, x)){
            if(map[y][x].val == id){
              if(!first) first = {y, x};
              suma++;
            }
          }
        }
        if(suma >= quant){
          for(let i : number = 0; i < suma; i++){
            map[first.y - i][first.x + i].del = true;
          }
        }
        suma = 0;
        first = null;
      })
    })
    let licznik : number = 0;
    for(let x : number = 0; x < 9; x++){
      for(let y : number = 0; y < 9; y++){
        if(map[y][x].del){
          licznik++;
          map[y][x] = {val: "null", background: "white"};
        }
      }
    }
    this.score += licznik;
  }
}

export default Game;