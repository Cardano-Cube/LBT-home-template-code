class RENDERDATA {
    constructor() {
        this.$mainTokenDom = document.querySelector("[template-wrapper='token-data']");
        this.$tokenPriceElement = this.$mainTokenDom?.querySelector("[token-data='price']");
        this.$changePercentElement = this.$mainTokenDom?.querySelector("[token-data='change-update']");
        this.$changeDurationElement = this.$mainTokenDom?.querySelector("[token-data='change-duration']");
        this.$tokenSlug = this.$mainTokenDom?.querySelector(".project-temp_short-name");

        this.$chartWrapper = this.$mainTokenDom?.querySelector("[token-data='chart']");

        this.$marketCapElement = this.$mainTokenDom?.querySelector("[token-data='market-cap']");
        this.$dilutedMarketCapElement = this.$mainTokenDom?.querySelector("[token-data='diluted-mkt-cap']");
        this.$circulatingSupplyElement = this.$mainTokenDom?.querySelector("[token-data='circulating-supply']");
        this.$circulatingPercentElement = this.$mainTokenDom?.querySelector("[token-data='circulating-percent']");
        this.$totalSupplyElement = this.$mainTokenDom?.querySelector("[token-data='total-supply']");
        this.$holderElement = this.$mainTokenDom?.querySelector("[token-data='holders']");
        this.$dailyVolumeElement = this.$mainTokenDom?.querySelector("[token-data='daily-volume']");
        this.$oneUsdElement = this.$mainTokenDom?.querySelector("[token-data='one-usd']");
        this.$releaseDateElement = this.$mainTokenDom?.querySelector("[token-data='release-date']");

        this.$mainDropDownWrapper = this.$mainTokenDom?.querySelector("[home-wrapper='dropdown']");
        this.$activeComponent = this.$mainDropDownWrapper?.querySelector("[dropdown-active='component']");
        this.$allCurrencyCategory = [...this.$mainDropDownWrapper?.querySelectorAll("[dropdown]")];
        this.$activeCurrencyImageElement = this.$activeComponent?.querySelector("img");
        this.$activeCurrencyText = this.$activeComponent?.querySelector(".tabs_dropdown-text");

        this.$durationTabs = [...this.$mainTokenDom?.querySelectorAll("[token-data-ctrl]")];

        this.$loader = document.querySelector("[wrapper='loader']");
        this.$wrapperToShow = document.querySelector("[wrapper='show']");

        this.$downloadButton = document.querySelector("[token-button='download']");

        this.$showBackupComponent = document.querySelectorAll("[wrapper='about']");
        this.$secondDexWrapper = document.querySelector("[asset-id]");
        this.$assetID = this.$secondDexWrapper?.getAttribute("asset-id");

        this.$desktopSwapper = document.querySelector("[show-if-token='desktop']");
        this.$mobileSwapper = document.getElementById("dexhunter-container");
        this.$desktopAboutWrapper = document.querySelector("[show-if-no-token='desktop']");
        this.$mobileAboutWrapper = document.querySelector("[show-if-no-token='mobile']");
        this.$allTabMenuArray = document.querySelectorAll(".swapper_tabs-menu");
        this.$backupPopupTrigger = document.querySelector(".for-popup-desk");
        this.$rightSideContainer = document.querySelector("[right='wrapper']");

        this.GLOBAL_DATA_OBJECT = {
            activeCurrency: "usd",
            tokenData: null,
            activeTab: "one-day",
            renderNewChart: true,
            chart: null,
            areaSeries: null,
            cookieName: "currentCurrency",
        }

        this.loadTokenDataAPI = "https://cron-jobs.milan-houter.workers.dev/";

        this.options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "triggerType": "individual_data", "asset": this.$tokenSlug?.textContent
            }),
        }

        this.viewportObserver = new ResizeObserver(this.handleViewportResize.bind(this));
        this.errorObserver = new ResizeObserver(this.handleViewPortOnError.bind(this));


        this.init();
    }

    init() {
        this.loadDataFromAPI();
        this.addFilterListeners();
    }

    addFilterListeners() {
        if (this.$allCurrencyCategory?.length > 0) {
            this.$allCurrencyCategory.forEach(currency => {
                currency.addEventListener("click", (evt) => {
                    let selectedCurrencyElement = evt.currentTarget;
                    this.updateDropDown(selectedCurrencyElement)
                    this.updateCookie(this.GLOBAL_DATA_OBJECT.cookieName, this.GLOBAL_DATA_OBJECT.activeCurrency, 30);

                    this.GLOBAL_DATA_OBJECT.renderNewChart = false;
                    this.renderDataOnChart();
                    this.renderDataOnDom();
                    $(this.$mainDropDownWrapper).trigger("w-close")
                })
            })
        }

        if (this.$durationTabs?.length > 0) {
            this.$durationTabs.forEach(tab => {
                tab.addEventListener("click", (evt) => {
                    let currentTabElement = evt.currentTarget;
                    let tabToActive = currentTabElement?.childNodes[0];
                    let tabToInactive = this.$durationTabs.filter(tab => {
                        return tab.childNodes[0].classList.contains("active-tab")
                    });
                    tabToInactive[0].childNodes[0].classList.remove("active-tab");
                    tabToActive.classList.add("active-tab");
                    let selectedDuration = currentTabElement?.getAttribute("token-data-ctrl");
                    this.GLOBAL_DATA_OBJECT.activeTab = selectedDuration;
                    this.GLOBAL_DATA_OBJECT.renderNewChart = false
                    this.renderDataOnChart();
                    this.renderDataOnDom();
                })
            })
        }
        if (this.$downloadButton != null) {
            this.$downloadButton.addEventListener("click", () => {
                this.downloadChart();
            })
        }
    }

    async loadDataFromAPI() {
        let callAPI = await fetch(this.loadTokenDataAPI, this.options).catch(err => console.log(err));
        let extractData = callAPI.ok != false && await callAPI.json();
        if (Object.keys(extractData).length > 0) {
            this.GLOBAL_DATA_OBJECT.tokenData = extractData;

            this.GLOBAL_DATA_OBJECT.activeCurrency = this.checkCookie(this.GLOBAL_DATA_OBJECT.cookieName) ?? "usd";
            this.dropDownCurrency = this.$allCurrencyCategory.filter(item => item.getAttribute("dropdown") === this.GLOBAL_DATA_OBJECT.activeCurrency);
            if (this.dropDownCurrency?.length > 0) {
                this.updateDropDown(this.dropDownCurrency[0])
            }

            this.renderDataOnDom(false);
            this.renderDataOnChart();
            this.renderSwapper();

            this.$wrapperToShow.style.opacity = 1;

            this.$desktopAboutWrapper.style.display = "none";
            this.$mobileAboutWrapper.style.display = "none";
            this.$rightSideContainer.style.opacity = 1;


            this.$loader.remove();
            this.viewportObserver.observe(document.body);

        }
        if (callAPI.ok == false && callAPI.status == 400) {
            this.handleError();
        }
    }

    handleError() {
        this.renderSwapper();
        this.errorObserver.observe(document.body);
        this.$rightSideContainer.style.opacity = 1;

    }

    updateDropDown(elementToActive) {
        let selectedCurrency = elementToActive?.getAttribute("dropdown");
        let selectedCurrencyName = elementToActive.textContent;
        let selectedCurrencyImage = elementToActive?.querySelector("img")?.getAttribute("src");

        this.$activeCurrencyImageElement.removeAttribute("srcset");
        this.$activeCurrencyImageElement.setAttribute("src", selectedCurrencyImage);
        this.$activeCurrencyText.textContent = selectedCurrencyName;
        this.GLOBAL_DATA_OBJECT.activeCurrency = selectedCurrency;
    }

    renderSwapper() {
        if (this.GLOBAL_DATA_OBJECT?.tokenData?.asset_id) {
            let scriptElement = document.createElement("script");
            scriptElement.type = "module";
            scriptElement.innerHTML = `ReactDOM.render( React.createElement( dexhunterSwap, {"orderTypes":["SWAP","LIMIT"],"defaultToken":"${this.GLOBAL_DATA_OBJECT.tokenData["asset_id"]}","colors":{"background":"#FFFFFF","containers":"#F6F6F9","subText":"#859DA2","mainText":"#11424A","buttonText":"#FFFFFF","accent":"#00D061"},"theme":"light","width":"100%","partnerCode":"cardanocube.io616464723171396666367678737577656775683370667135716b6164756361746a65343468346a6437373678637a7266377466346c77733564666d6a6c68687133356c72717865367539633575667a7a733361306479357a3433746c32377466737a3875366c7ada39a3ee5e6b4b0d3255bfef95601890afd80709","partnerName":"CardanoCube.io"} ), document.getElementById('dexhunter-root') );`;
            document.body.appendChild(scriptElement);

            let scriptSecondElement = document.createElement("script");
            scriptSecondElement.type = "module";
            scriptSecondElement.innerHTML = `ReactDOM.render( React.createElement( dexhunterSwap, {"orderTypes":["SWAP","LIMIT"],"defaultToken":"${this.GLOBAL_DATA_OBJECT.tokenData["asset_id"]}","colors":{"background":"#FFFFFF","containers":"#F6F6F9","subText":"#859DA2","mainText":"#11424A","buttonText":"#FFFFFF","accent":"#00D061"},"theme":"light","width":"100%","partnerCode":"cardanocube.io616464723171396666367678737577656775683370667135716b6164756361746a65343468346a6437373678637a7266377466346c77733564666d6a6c68687133356c72717865367539633575667a7a733361306479357a3433746c32377466737a3875366c7ada39a3ee5e6b4b0d3255bfef95601890afd80709","partnerName":"CardanoCube.io"} ), document.getElementById('dexhunter-root-mobile') );`;
            document.body.appendChild(scriptSecondElement);

        }

        if (this.$secondDexWrapper != undefined & this.$assetID != "") {
            let scriptElement = document.createElement("script");
            scriptElement.type = "module";
            scriptElement.innerHTML = `ReactDOM.render( React.createElement( dexhunterSwap, {"orderTypes":["SWAP","LIMIT"],"defaultToken":"${this.$assetID}","colors":{"background":"#FFFFFF","containers":"#F6F6F9","subText":"#859DA2","mainText":"#11424A","buttonText":"#FFFFFF","accent":"#00D061"},"theme":"light","width":"100%","partnerCode":"cardanocube.io616464723171396666367678737577656775683370667135716b6164756361746a65343468346a6437373678637a7266377466346c77733564666d6a6c68687133356c72717865367539633575667a7a733361306479357a3433746c32377466737a3875366c7ada39a3ee5e6b4b0d3255bfef95601890afd80709","partnerName":"CardanoCube.io"} ), document.getElementById('dexhunter-root') );`;
            document.body.appendChild(scriptElement);

            let scriptSecondElement = document.createElement("script");
            scriptSecondElement.type = "module";
            scriptSecondElement.innerHTML = `ReactDOM.render( React.createElement( dexhunterSwap, {"orderTypes":["SWAP","LIMIT"],"defaultToken":"${this.$assetID}","colors":{"background":"#FFFFFF","containers":"#F6F6F9","subText":"#859DA2","mainText":"#11424A","buttonText":"#FFFFFF","accent":"#00D061"},"theme":"light","width":"100%","partnerCode":"cardanocube.io616464723171396666367678737577656775683370667135716b6164756361746a65343468346a6437373678637a7266377466346c77733564666d6a6c68687133356c72717865367539633575667a7a733361306479357a3433746c32377466737a3875366c7ada39a3ee5e6b4b0d3255bfef95601890afd80709","partnerName":"CardanoCube.io"} ), document.getElementById('dexhunter-root-mobile') );`;
            document.body.appendChild(scriptSecondElement);
        }


        if (this.$showBackupComponent?.length > 0) {
            this.$showBackupComponent.forEach(comp => {
                // comp.classList.remove("hide-wrapper");

                this.$releaseDateAbout = comp.querySelector("[about-card='date']");
                this.$totalSupplyAbout = comp.querySelector("[about-card='total-supply']");

                let decimalAddedTotalSupply = this.GLOBAL_DATA_OBJECT?.tokenData?.total_supply && this.cutZeros(this.GLOBAL_DATA_OBJECT.tokenData["total_supply"], this.GLOBAL_DATA_OBJECT.tokenData["decimals"]);


                let total_supply = decimalAddedTotalSupply

                if (total_supply != undefined) {
                    this.$totalSupplyAbout.innerHTML = this.convertToInternationalCurrencySystem(total_supply) + " " + this.$tokenSlug.textContent;
                }

                if (this.GLOBAL_DATA_OBJECT?.tokenData?.created_date != undefined) {
                    this.$releaseDateAbout.textContent = this.GLOBAL_DATA_OBJECT?.tokenData?.created_date && new Date(this.GLOBAL_DATA_OBJECT.tokenData["created_date"]).getFullYear();
                }
            })
        }

    }

    HandleShowAndHideElement() {
        if (window.screen.width > 1279) {
            this.$desktopSwapper.style.display = "block"
            if (this.GLOBAL_DATA_OBJECT?.tokenData?.asset_id == undefined && this.$assetID == "") {
                this.$allTabMenuArray?.forEach(tab => {
                    tab.style.display = "none";
                });
                this.$backupPopupTrigger.style.display = "none";
                this.$desktopSwapper.style.display = "none";

            } else {
                this.$allTabMenuArray?.forEach((tab, index) => {
                    if (index == 1) tab.style.display = "flex";
                });
                this.$desktopAboutWrapper.style.display = "none"
                this.$desktopSwapper.style.display = "block";

            }

            this.$backupPopupTrigger.style.display = "none";
        } else {
            this.$allTabMenuArray?.forEach((tab, index) => {
                if (index == 1) tab.style.display = "none";
            });
            if (this.GLOBAL_DATA_OBJECT?.tokenData?.asset_id == undefined && this.$assetID == "") {
                this.$backupPopupTrigger.style.display = "none";
                this.$desktopSwapper.style.display = "none"
            } else {
                this.$backupPopupTrigger.style.display = "flex";
                this.$desktopAboutWrapper.style.display = "block"
                this.$desktopSwapper.style.display = "none"
            }
            this.$mobileAboutWrapper.style.display = "none"
        }
    }
    renderDataOnDom() {
        if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
            this.$tokenPriceElement.innerHTML = "$" + this.reduceNumber(this.GLOBAL_DATA_OBJECT.tokenData.price_in_usd);

            if (this.GLOBAL_DATA_OBJECT.activeTab == "one-day") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["24h_change_usd"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_usd"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_usd"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_usd"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }

                this.$changeDurationElement.textContent = "24H";
            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "seven-day") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["7d_change_usd"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_usd"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_usd"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_usd"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "7D";

            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-month") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_usd"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_usd"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_usd"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_usd"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }

                this.$changeDurationElement.textContent = "1M";

            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-year") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_usd"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_usd"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_usd"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }
                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_usd"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "1Y";
            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "all") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_usd"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_usd"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_usd"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }
                else if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_usd"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "All";
            }

        }
        else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
            this.$tokenPriceElement.innerHTML = this.reduceNumber(this.GLOBAL_DATA_OBJECT.tokenData?.price_in_ada) + "<span style='font-weight:500;'>₳</span>";

            if (this.GLOBAL_DATA_OBJECT.activeTab == "one-day") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["24h_change_ada"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_ada"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_ada"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_ada"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }

                this.$changeDurationElement.textContent = "24H";
            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "seven-day") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["7d_change_ada"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_ada"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_ada"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_ada"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "7D";

            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-month") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_ada"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_ada"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_ada"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_ada"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }

                this.$changeDurationElement.textContent = "1M";

            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-year") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_ada"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_ada"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_ada"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }
                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_ada"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "1Y";
            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "all") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_ada"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_ada"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_ada"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }
                else if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_ada"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "All";
            }

        }

        // ** Render other data
        this.$marketCapElement.textContent = "-";

        this.$dilutedMarketCapElement.textContent = "-";

        this.$circulatingSupplyElement.textContent = "-";

        this.$circulatingPercentElement.textContent = "-";

        let decimalAddedTotalSupply = this.GLOBAL_DATA_OBJECT.tokenData["total_supply"] && this.cutZeros(this.GLOBAL_DATA_OBJECT.tokenData["total_supply"], this.GLOBAL_DATA_OBJECT.tokenData["decimals"]);

        let total_supply = decimalAddedTotalSupply

        this.$totalSupplyElement.textContent = this.convertToInternationalCurrencySystem(total_supply) + " " + this.$tokenSlug.textContent;

        this.$holderElement.textContent = this.formatNumberWithCommas(this.GLOBAL_DATA_OBJECT.tokenData["holders"], false);

        let dailyVolume = this.formatNumberWithCommas(this.GLOBAL_DATA_OBJECT.tokenData["24h_vol_usd"]);

        this.$dailyVolumeElement.textContent = "$" + dailyVolume;

        this.$oneUsdElement.textContent = this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["1USD"]) + " " + this.$tokenSlug.textContent;

        this.$releaseDateElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["created_date"] && new Date(this.GLOBAL_DATA_OBJECT.tokenData["created_date"]).getFullYear();
    }

    cutZeros(number, zerosToCut) {
        if (zerosToCut == 0) return number;
        let strNum = number.toString();
        return strNum.slice(0, -zerosToCut);
    }


    renderDataOnChart(reRender) {
        if (this.GLOBAL_DATA_OBJECT.activeTab == "one-day") {
            if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {

                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_24h_usd"], reRender);
            } else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {

                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_24h_ada"], reRender);

            }
        }
        else if (this.GLOBAL_DATA_OBJECT.activeTab == "seven-day") {
            if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_7d_usd"], reRender);
            } else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_7d_ada"], reRender);

            }

        } else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-month") {
            if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_1mo_usd"], reRender);
            } else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_1mo_ada"], reRender);

            }

        } else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-year") {
            if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_1y_usd"], reRender);
            } else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_1y_ada"], reRender);

            }

        }
        else if (this.GLOBAL_DATA_OBJECT.activeTab == "all") {
            if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_all_usd"], reRender);
            } else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_all_ada"], reRender);

            }

        }
    }

    createLineChart(element, data, resize = false) {
        // ** clear chart on view change
        if (element.firstChild && resize) {
            element.removeChild(element.firstChild);
            this.GLOBAL_DATA_OBJECT.renderNewChart = true;
        }

        let chartHeight = parseFloat(window.getComputedStyle(element).height);
        let chartWidth = parseFloat(window.getComputedStyle(element).width);

        const formattedData = this.formatData(data);

        if (this.GLOBAL_DATA_OBJECT.renderNewChart) {
            // Create a new Lightweight Chart
            this.GLOBAL_DATA_OBJECT.chart = LightweightCharts.createChart(element, {
                width: chartWidth,
                height: chartHeight,
                layout: {
                    backgroundColor: '#ffffff',
                    textColor: 'rgba(33, 56, 77, 1)',
                },
                grid: {
                    vertLines: {
                        color: 'rgba(197, 203, 206, 0.0)',
                    },
                    horzLines: {
                        color: 'rgba(197, 203, 206, 0.0)',
                    },
                },
                rightPriceScale: {
                    borderVisible: false,
                },
                leftPriceScale: {
                    borderVisible: false,
                },
                priceScale: {
                    autoScale: false, // Disable auto-scaling
                },
                timeScale: {
                    borderVisible: false,
                    timeVisible: true,
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                },
                handleScroll: false, // Disable scroll events
                handleScale: false, // Disable zoom events

            });

            this.GLOBAL_DATA_OBJECT.chart.subscribeCrosshairMove(function (param) {
                if (param === undefined || param.seriesPrices === undefined) {
                    return;
                }
            });

            this.GLOBAL_DATA_OBJECT.areaSeries = this.GLOBAL_DATA_OBJECT.chart.addAreaSeries({
                topColor: '#dfd4ff',
                bottomColor: '#dfd4ff0f',
                lineColor: '#4D3C80',
                lineWidth: 1,
                priceFormat: {
                    type: 'price',
                    // formatter: (price) => parseFloat(price).toFixed(8),
                    precision:4,
                    minMove:0.0001

                },
                lastValueVisible: true,
                priceLineVisible: true,
            })

            this.GLOBAL_DATA_OBJECT.chart.priceScale('right').applyOptions({
                scaleMargins: {
                    top: 0.35,
                    bottom: 0.2,
                },

            });

            this.GLOBAL_DATA_OBJECT.areaSeries.setData(formattedData);

        } else {
            this.GLOBAL_DATA_OBJECT.areaSeries.setData(formattedData);
        }

        this.GLOBAL_DATA_OBJECT.chart.timeScale().fitContent();
    }


    downloadChart() {
        const imageDataURL = this.GLOBAL_DATA_OBJECT.chart.takeScreenshot();
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataURL.toDataURL();
        const fileName = new Date().getFullYear();
        downloadLink.download = `chart${fileName}.png`;
        downloadLink.click();
    }

    formatData(dataObject) {
        const formattedData = [];

        for (const timestamp in dataObject) {
            if (dataObject.hasOwnProperty(timestamp)) {
                const value = dataObject[timestamp];
                // Ensure the value is a float with 5 decimal places
                const formattedValue = value;
                formattedData.push({ time: this.convertTimeDate(timestamp), value: formattedValue });
            }
        }

        // Sort the formatted data by time in ascending order
        formattedData.sort((a, b) => a.time - b.time);

        return formattedData;
    }

    convertTimeDate(inputTime) {
        // Parse the input time string into a Date object
        let date = new Date(inputTime);

        // Convert the date to a Unix timestamp (seconds since January 1, 1970)
        let timestamp = Math.floor(date.getTime() / 1000);

        return timestamp;
    }

    formatNumberWithCommas(number, isUSCurrency) {
        // Check if isUSCurrency is true or not
        if (isUSCurrency) {
            // Format as US currency (e.g., 1,234.56)
            return number.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        } else {
            // Format as normal currency (e.g., 1 234,56)
            return number.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        }
    }

    convertToInternationalCurrencySystem(labelValue) {

        // Nine Zeroes for Billions
        return Math.abs(Number(labelValue)) >= 1.0e+9

            ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B"
            // Six Zeroes for Millions 
            : Math.abs(Number(labelValue)) >= 1.0e+6

                ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + "M"
                // Three Zeroes for Thousands
                : Math.abs(Number(labelValue)) >= 1.0e+3

                    ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"

                    : Math.abs(Number(labelValue));

    }


    checkIfLowOrHigh(token) {
        return token?.toString()?.startsWith("-");
    }

    reduceNumber(price) {
        const decimalPlaces = String(price) // Calculate the number of decimal places
        const stringNumber = price.toFixed(decimalPlaces.length); // Use the calculated number of decimal places
        const splitToZeros = stringNumber?.split(".");
        const numberBeforeDecimal = splitToZeros[0];
        const numberAfterDecimal = parseFloat(String(splitToZeros[1])?.replace(/0/g, ''));
        const leadingZeros = Math.ceil(Math.log10(1 / price));
        console.log(leadingZeros);
        if (leadingZeros > 5) {
            // Generate the format string with leading zeros
            const formatString = `${"0".repeat(leadingZeros).length - 1}`;

            return `${numberBeforeDecimal}.0<sub>${formatString}</sub>${numberAfterDecimal}`

        } else {
            // If the price is not lower than the threshold, simply return the price with 2 decimals
            return parseFloat(parseFloat(price).toFixed(5)).toString();
        }
    }

    formatNumber(num, removeNeg) {
        // Remove "-" sign if present
        removeNeg ? num = Math.abs(num) : "";

        if (num >= 1000) {
            return (num / 1000).toFixed(2) + "K";
        } else {
            return num?.toFixed(2);
        }
    }

    handleViewportResize(entries) {
        this.$wrapperToShow.style.opacity = "1";
        if (window.screen.width > 1279) {
            this.$desktopSwapper.style.display = "block";
            this.$allTabMenuArray?.forEach(tab => {
                tab.style.display = "flex"
            })
        } else {
            this.$allTabMenuArray?.forEach((tab, index) => {
                if (index == 1) tab.style.display = "none"
            })
            this.$desktopSwapper.style.display = "none";
        }
        this.renderDataOnChart(true);
    }

    handleViewPortOnError(entries) {
        this.HandleShowAndHideElement();
    }

    checkCookie(cookieName) {
        // Split document.cookie into individual cookies
        let cookies = document.cookie.split(';');
        // Loop through the cookies
        for (let i = 0; i < cookies.length; i++) {
            // Split the cookie into name and value
            let cookie = cookies[i].trim().split('=');
            // Check if the cookie name matches the provided name
            if (cookie[0] === cookieName) {
                // Cookie exists, return its value
                return cookie[1];
            }
        }
        // Cookie does not exist
        return null;
    }

    updateCookie(cookieName, cookieValue, expirationDays) {
        let d = new Date();
        d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
    }
}

new RENDERDATA;