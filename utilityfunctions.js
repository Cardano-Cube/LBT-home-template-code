function hideOrShowLinks(){
    let linkWrapper = document.querySelector("[wrapper='social-links']");
    let allLinks = [...linkWrapper?.querySelectorAll("a")];
    let checkNoLinks = allLinks.filter(linkItem =>{
        if(linkItem.getAttribute("href").indexOf("#")===0){
            return true
        }else{
            return false;
        }
    })

  if(allLinks?.length === checkNoLinks?.length){
    linkWrapper.style.display="none";
  }
}

function moveCms(){
    let checkWindow = window.screen.width<1280;
    let wrapperToMove = document.querySelector("[wrapper='collection']");
    let wrapperToInject = document.querySelector("[inject='collection']");

    if(checkWindow){
        wrapperToInject.appendChild(wrapperToMove);
    }
}

function showMore(){
    let wrapperToHideShow = document.querySelector("[wrapper='show-more']");
    let showMoreCta = document.querySelector("[token-button='show-more']");
    let showMoreText = showMoreCta?.querySelector("div");
    let arrowIcon = showMoreCta?.querySelector("img");

    if(showMoreCta != null){
        showMoreCta.addEventListener("click",()=>{
            if(wrapperToHideShow.classList.contains("hide-wrapper")){
                wrapperToHideShow.classList.remove("hide-wrapper");
                arrowIcon.style.transform = "rotate(180deg)";
                showMoreText.textContent = "Show less";
            }
            else{
                wrapperToHideShow.classList.add("hide-wrapper");
                arrowIcon.style.transform = "rotate(0deg)";
                showMoreText.textContent = "Show more";
            }
        })
    }
}

function resizeHandler(){
    const viewportObserver = new ResizeObserver(moveCms);
    viewportObserver.observe(document.body);

}

showMore();
resizeHandler();
hideOrShowLinks();