class U{
  static q = (val: string) : Node => document.querySelector(val)
  static qa = (val: string) : NodeListOf<Element> => document.querySelectorAll(val)
  static el = (val: string) : HTMLElement => document.createElement(val)
  static colors : Array<string> = [
    "#030B1E",
    "#D80870",
    "#2F26E0",
    "#DB0F0F",
    "#FFBB00",
    "#51AD35",
    "#7EB7B1"
  ]
  static pathHoverColor : string = "#d4d4d4";
  static pathBallMoveColor : string = "#9D9D9D";
}

export default U;