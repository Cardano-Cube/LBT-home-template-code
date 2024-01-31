class addSlickSlider {
    constructor(sliderObj) {
        this.sliderObj = sliderObj;
        this.$sliderParent = this.sliderObj.sliderParent;
        this.dots = this.sliderObj.dots ?? true;
        this.slidesToScroll = this.sliderObj.slidesToScroll ?? 1;
        this.slidesToShow = this.sliderObj.slidesToShow ?? 1;
        this.infinite = this.sliderObj.infinite ?? false;
        this.autoplay = this.sliderObj.autoplay ?? true;
        this.autoplaySpeed = this.sliderObj.autoplaySpeed ?? 1000;
        this.arrows = this.sliderObj.arrows ?? true;
        this.speed = this.sliderObj.speed ?? 500;
        this.fade = this.sliderObj.fade ?? false;
        this.nextArrow = this.sliderObj.nextArrow;
        this.prevArrow = this.sliderObj.prevArrow;
        this.centerMode = this.sliderObj.centerMode ?? false;
        this.showonRespo = this.sliderObj.responsive;
        this.initElement();
    }

    initElement() {
        if (this.$sliderParent.length <= 0) return;
        this.$sliderParent.forEach(element => {
            let sliderWrapper = element.querySelector("[slick-slider='slider-child']");//Add this attribute to slider item.
            let $paginationBox = element.querySelector("[slick-slider='bread-crums-box']"); //Add this attribute to pagination dot wrapper.
            this.activateSlider({ sliderWrapper, $paginationBox });
        });
    }

    activateSlider(sliderObj) {
        let sliderControl = $(sliderObj.sliderWrapper).slick({
            dots: this.dots,
            slidesToShow: this.slidesToShow,
            slidesToScroll: this.slidesToScroll,
            centerMode: this.centerMode,
            infinite: this.infinite,
            autoplay: this.autoplay,
            autoplaySpeed: this.autoplaySpeed,
            arrows: this.arrows,
            speed: this.speed,
            fade: this.fade,
            prevArrow: this.prevArrow,
            nextArrow: this.nextArrow,
            variableWidth: true,
            appendDots: this.dots != false ? sliderObj.$paginationBox : "none", //set this wrapper to relative.
        });
    }
}
// activate slider
let sliderObj = {
    sliderParent: document.querySelectorAll("[slider-parent='desktop']"),
    slidesToShow: 1,
    slidesToScroll: 1, //This won't work when center mode in on/true.
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
    speed: 500,
    fade: false,
    centerMode: false,
    dots: true,
    arrows: false,
    prevArrow: null,
    nextArrow: null,
    responsive: 1,
}
new addSlickSlider(sliderObj);
 
function MobileSlider(){
    let mobileParent = document.querySelector("[slider-parent='mobile']");
    let cmsWrapper = document.querySelectorAll("[item-to='extract']");
    let toInject = mobileParent?.querySelector("[slick-slider='slider-child']");
    let wrapperToClean = toInject.querySelector("[promoted='wrapper']");
    let slideToClone = mobileParent?.querySelector("[slide-to='clone']");

    wrapperToClean.remove();

    if(cmsWrapper?.length>0){
        cmsWrapper.forEach(item =>{
            let clonedWrapper = slideToClone.cloneNode(true);
            clonedWrapper.appendChild(item);
            toInject.appendChild(clonedWrapper);
        })
        slideToClone.remove();
        
        let sliderObjMob = {
            sliderParent: document.querySelectorAll("[slider-parent='mobile']"),
            slidesToShow: 1,
            slidesToScroll: 1, //This won't work when center mode in on/true.
            infinite: true,
            autoplay: false,
            autoplaySpeed: 3000,
            speed: 500,
            fade: false,
            centerMode: true,
            dots: true,
            arrows: false,
            prevArrow: null,
            nextArrow: null,
            responsive: 1,
        }
       new addSlickSlider(sliderObjMob)
    }
}

export default MobileSlider;