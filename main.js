/**
 *  <div class="modal-backdrop">
        <div class="modal-container">
            <button class="modal-close">&times;</button>
            <div class="modal-content">
                .....
            </div>
        </div>
    </div>
 */

/**
 * Modal Management Library
 */

// Utility functions for quick DOM selection
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

Modal.elements = [];

function Modal(options = {}) {
    const {
        templateId,
        destroyOnClose = true,
        footer = false,
        closeMethods = ["button", "overlay", "escape"],
        cssClass = [],
        onOpen,
        onClose,
    } = options;

    const template = $(`#${templateId}`);
    if (!template) {
        console.error(`#${templateId} does not exsist`);
        return;
    }

    this._allowButtonClose = closeMethods.includes("button");
    this._allowBackdropClose = closeMethods.includes("overlay");
    this._allowEscapeClose = closeMethods.includes("escape");

    this.build = () => {
        // Create elements
        const content = template.content.cloneNode(true);
        this._backdrop = document.createElement("div");
        this._backdrop.className = "modal-backdrop";

        const container = document.createElement("div");
        container.className = "modal-container";

        cssClass.forEach((className) => {
            if (typeof className === "string") {
                container.classList.add(className);
            }
        });

        if (this._allowButtonClose) {
            const closeBtn = document.createElement("button");
            closeBtn.className = "modal-close";
            closeBtn.innerHTML = "&times;";
            container.append(closeBtn);
            closeBtn.onclick = () => this.close();
        }

        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";
        modalContent.append(content);
        container.append(modalContent);

        if (footer) {
            this._modalFooter = document.createElement("footer");
            this._modalFooter.className = "modal-footer";

            if (this._footerContent) {
                this._modalFooter.innerHTML = this._footerContent;
            }

            // loop through button array & append each btn to the modalFooter
            this._footerButtons.forEach((btn) => {
                this._modalFooter.append(btn);
            });

            container.append(this._modalFooter);
        }

        // Append elements to complete the backdrop
        this._backdrop.append(container);
        document.body.append(this._backdrop);
    };

    this._footerButtons = [];

    this.addFooterButton = (title, cssClass, callback) => {
        const footerBtn = document.createElement("button");
        footerBtn.className = cssClass;
        footerBtn.innerHTML = title;
        footerBtn.onclick = callback;
        this._footerButtons.push(footerBtn);

        // support add new footer's buttons when modal is opening
        if (this._modalFooter) {
            this._footerButtons.forEach((btn) => {
                this._modalFooter.append(btn);
            });
        }
    };

    this.setFooterContent = (html) => {
        this._footerContent = html;

        // support adjust new footer's content when modal is opening
        if (this._modalFooter) {
            this._modalFooter.innerHTML = html;
        }
    };

    this.open = () => {
        // push obj Modal into an array everytime this.open is triggered
        Modal.elements.push(this);

        if (!this._backdrop) {
            this.build();
        }

        //  Preventing scrolling
        document.body.classList.add("no-scroll");
        document.body.style.paddingRight = getScrolbarlWidth() + "px";

        setTimeout(() => {
            this._backdrop.classList.add("show");
        }, 0);

        if (this._allowBackdropClose) {
            this._backdrop.onclick = (e) => {
                if (e.target === this._backdrop) {
                    this.close();
                }
            };
        }

        if (this._allowEscapeClose) {
            document.addEventListener("keydown", this._handleEscapeKey);
        }

        this._onTransitionEnd(() => {
            if (typeof onOpen === "function") onOpen();
        });

        return this._backdrop;
    };

    // create function & save the reference to this._handleEscapeKey
    this._handleEscapeKey = (e) => {
        const lastModal = Modal.elements[Modal.elements.length - 1];
        if ((e.key === "Escape") & (this === lastModal)) {
            this.close();
        }
    };

    this.close = (isDestroyed = destroyOnClose) => {
        // remove obj Modal everytime this.close is triggered
        Modal.elements.pop();

        this._backdrop.classList.remove("show");

        // once this.close triggered -> remove event listener
        if (this._allowEscapeClose) {
            document.removeEventListener("keydown", this._handleEscapeKey);
        }

        this._onTransitionEnd(() => {
            // condition to remove backdrop out of DOM
            if (isDestroyed && this._backdrop) {
                this._backdrop.remove();
                this._backdrop = null;
                this._modalFooter = null;
            }

            if (typeof onClose === "function") onClose();

            // Condition to enable scrolling when opening multi modals at the same time
            if (!Modal.elements.length) {
                document.body.classList.remove("no-scroll");
                document.body.style.paddingRight = "";
            }
        });
    };

    this.destroy = () => {
        this.close(true);
    };

    this._onTransitionEnd = (callback) => {
        this._backdrop.ontransitionend = (e) => {
            // Guard against multiple transitions
            if (e.propertyName !== "transform") return;
            if (typeof callback === "function") callback();
        };
    };

    function getScrolbarlWidth() {
        if (getScrolbarlWidth.value) return getScrolbarlWidth.value;

        const div = document.createElement("div");
        Object.assign(div.style, {
            overflow: "scroll",
            position: "absolute",
            top: "-9999px",
        });

        document.body.appendChild(div);
        const scrollbarWidth = div.offsetWidth - div.clientWidth;
        getScrolbarlWidth.value = scrollbarWidth;
        document.body.removeChild(div);

        return scrollbarWidth;
    }
}

// Test modal1
const modal1 = new Modal({
    templateId: "modal-1",
    destroyOnClose: false,
    onOpen: () => {
        console.log("Modal 1 opened");
    },
    onClose: () => {
        console.log("Modal 1 closed");
    },
});

$("#open-modal-1").onclick = () => {
    modal1.open();
};

// Test modal2
const modal2 = new Modal({
    templateId: "modal-2",
    // closeMethods: ["button", "escape"],
    cssClass: ["class1", "class2", "classN", 123],
    onOpen: () => {
        console.log("Modal 2 opened");
    },
    onClose: () => {
        console.log("Modal 2 closed");
    },
});

$("#open-modal-2").onclick = () => {
    const modalElement = modal2.open();

    const form = modalElement.querySelector("#login-form");
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = {
                email: $("#email").value.trim(),
                password: $("#password").value.trim(),
            };
            console.log(formData);
        };
    }
};

// Test modal 3
const modal3 = new Modal({
    templateId: "modal-3",
    closeMethods: [],
    footer: true,
    onOpen: () => {
        console.log("Modal 3 opened");
    },
    onClose: () => {
        console.log("Modal 3 closed");
    },
});

$("#open-modal-3").onclick = () => {
    modal3.open();
};

// modal3.setFooterContent("<h2>Hello</h2>");

modal3.addFooterButton("Danger", "modal-btn danger pull-left", (e) => {
    alert("Danger clicked!");
});

modal3.addFooterButton("Cancel", "modal-btn", (e) => {
    modal3.close();
});

modal3.addFooterButton("<span>Agree</span>", "modal-btn primary", (e) => {
    // Handle something
    modal3.close();
});

// modal.close() -> remove class "show" only
// modal.destroy() -> remove class show + modal out of DOM
// only escape + modal.destroy() -> error
