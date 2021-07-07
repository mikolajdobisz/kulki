import U from "./UiClass";

export default class Msg{

  text: string;
  element: HTMLElement;
  removed: boolean;

  constructor(text: string){
    this.removed = false;
    this.text = text;
    this.element = U.el("div");
    this.element.classList.add("Msg-background");
    this.element.innerHTML = this.template();
    document.body.appendChild(this.element);
    const confirm = this.element.querySelector(".confirm");
    confirm.addEventListener("click", this.close);
    this.element.addEventListener("click", this.close);
  }

  close = () => {
    if(!this.removed){
      document.body.removeChild(this.element);
      this.removed = true;
    }
  }

  template = () => `
    <div class="Msg">
      <div class="text">
        ${this.text}
      </div>
      <div>
        <button class="confirm btn">OK</div>
      </div>
    </div>
  `
}