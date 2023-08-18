let theme = localStorage.getItem(`theme`)
let pdt = `black`
if(pdt != `dark` && pdt != `light` && pdt != `black`) pdt = `black`
if(!theme) {
    document.getElementsByTagName(`html`)[0].setAttribute(`class`, pdt)
    localStorage.setItem(`theme`, pdt)
    document.cookie = `theme=${pdt}; max-age=9999; path=/`;
}
switch (theme) {
    case `light`:
        document.getElementsByTagName(`html`)[0].setAttribute(`class`,`light`)
        break;
    case `dark`:
        document.getElementsByTagName(`html`)[0].setAttribute(`class`,`dark`)
        break;
    case `black`:
        document.getElementsByTagName(`html`)[0].setAttribute(`class`,`black`)
        break;
}

