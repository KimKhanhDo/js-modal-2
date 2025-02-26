/**
 *  <div class="popzy__backdrop">
        <div class="popzy__container">
            <button class="popzy__close">&times;</button>
            <div class="popzy__content">
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

Popzy.elements = [];

function Popzy(options = {}) {
    this.opt = Object.assign(
        {
            // templateId,
            destroyOnClose: true,
            footer: false,
            closeMethods: ["button", "overlay", "escape"],
            cssClass: [],
            // onOpen,
            // onClose,
        },
        options
    );

    this.template = $(`#${this.opt.templateId}`);
    if (!this.template) {
        console.error(`#${this.opt.templateId} does not exsist`);
        return;
    }

    const { closeMethods } = this.opt;
    this._allowButtonClose = closeMethods.includes("button");
    this._allowBackdropClose = closeMethods.includes("overlay");
    this._allowEscapeClose = closeMethods.includes("escape");

    this._footerButtons = [];

    this._handleEscapeKey = this._handleEscapeKey.bind(this);
}

Popzy.prototype.build = function () {
    // Create elements
    const content = this.template.content.cloneNode(true);
    this._backdrop = document.createElement("div");
    this._backdrop.className = "popzy__backdrop";

    const container = document.createElement("div");
    container.className = "popzy__container";

    this.opt.cssClass.forEach((className) => {
        if (typeof className === "string") {
            container.classList.add(className);
        }
    });

    if (this._allowButtonClose) {
        const closeBtn = this._createButton("&times;", "popzy__close", () => this.close());
        container.append(closeBtn);
    }

    const modalContent = document.createElement("div");
    modalContent.className = "popzy__content";
    modalContent.append(content);
    container.append(modalContent);

    if (this.opt.footer) {
        this._modalFooter = document.createElement("footer");
        this._modalFooter.className = "popzy__footer";

        this._renderFooterContent();
        this._renderFooterButtons();
        container.append(this._modalFooter); // loop through btn array & append each btn to the modalFooter
    }

    // Append elements to complete the backdrop
    this._backdrop.append(container);
    document.body.append(this._backdrop);
};

Popzy.prototype._createButton = function (title, cssClass, callback) {
    const button = document.createElement("button");
    button.className = cssClass;
    button.innerHTML = title;
    button.onclick = callback;
    // button.onclick()

    return button;
};

Popzy.prototype.addFooterButton = function (title, cssClass, callback) {
    const footerBtn = this._createButton(title, cssClass, callback);
    this._footerButtons.push(footerBtn);
    this._renderFooterButtons();
};

Popzy.prototype._renderFooterButtons = function () {
    // support add new footer's buttons while modal is opening
    if (this._modalFooter) {
        this._footerButtons.forEach((btn) => {
            this._modalFooter.append(btn);
        });
    }
};

Popzy.prototype._renderFooterContent = function () {
    // condition to support adjust new footer's content while modal is opening
    if (this._modalFooter && this._footerContent) {
        this._modalFooter.innerHTML = this._footerContent;
    }
};

Popzy.prototype.setFooterContent = function (html) {
    this._footerContent = html;
    this._renderFooterContent();
};

Popzy.prototype.open = function () {
    // push obj Modal into an array everytime this.open is triggered
    Popzy.elements.push(this);

    if (!this._backdrop) {
        this.build();
    }

    //  Preventing scrolling
    document.body.classList.add("popzy--no-scroll");
    document.body.style.paddingRight = this._getScrolbarlWidth() + "px";

    setTimeout(() => {
        this._backdrop.classList.add("popzy--show");
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

        // document.keydown = this._handleEscapeKey
        // document.keydown()
    }

    this._onTransitionEnd(this.opt.onOpen);

    return this._backdrop;
};

// create function & save the reference to this._handleEscapeKey
Popzy.prototype._handleEscapeKey = function (e) {
    console.log(this);

    const lastModal = Popzy.elements[Popzy.elements.length - 1];
    if ((e.key === "Escape") & (this === lastModal)) {
        this.close();
    }
};

Popzy.prototype.close = function (isDestroyed = this.opt.destroyOnClose) {
    // remove obj Modal everytime this.close is triggered
    Popzy.elements.pop();

    // console.log(this);

    this._backdrop.classList.remove("popzy--show");

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

        if (typeof this.opt.onClose === "function") this.opt.onClose();

        // Condition to enable scrolling when opening multi modals at the same time
        if (!Popzy.elements.length) {
            document.body.classList.remove("popzy--no-scroll");
            document.body.style.paddingRight = "";
        }
    });
};

Popzy.prototype.destroy = function () {
    this.close(true);
};

Popzy.prototype._onTransitionEnd = function (callback) {
    this._backdrop.ontransitionend = (e) => {
        // Guard against multiple transitions
        if (e.propertyName !== "transform") return;
        if (typeof callback === "function") callback();
    };
};

Popzy.prototype._getScrolbarlWidth = function () {
    if (this._scrolbarlWidth) return this._scrolbarlWidth;

    const div = document.createElement("div");
    Object.assign(div.style, {
        overflow: "scroll",
        position: "absolute",
        top: "-9999px",
    });

    document.body.appendChild(div);
    this._scrolbarlWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);

    return this._scrolbarlWidth;
};

// Test modal1
const modal1 = new Popzy({
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
const modal2 = new Popzy({
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
const modal3 = new Popzy({
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

modal3.addFooterButton("Danger", "popzy__btn popzy__btn--danger popzy__btn--pull-left", (e) => {
    alert("Danger clicked!");
});

modal3.addFooterButton("Cancel", "popzy__btn", (e) => {
    modal3.close();
});

modal3.addFooterButton("<span>Agree</span>", "popzy__btn popzy__btn--primary", (e) => {
    // Handle something
    modal3.close();
});

// Popzy.close() -> remove class "show" only
// Popzy.destroy() -> remove class show + modal out of DOM
// only escape + Popzy.destroy() -> error
