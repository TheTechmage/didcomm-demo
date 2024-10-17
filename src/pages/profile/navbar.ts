import * as m from "mithril"
import Icon from "../../components/icon"
import HelpModal from "./help"

import "./navbar.css"

import { library } from "@fortawesome/fontawesome-svg-core"
import {
  faArrowLeft,
  faCircle,
  faEdit,
  faRefresh,
  faChevronDown,
  faChevronUp,
  faCircleQuestion,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons"
import agent from "../../lib/agent"

library.add(
  faArrowLeft,
  faCircle,
  faEdit,
  faRefresh,
  faChevronDown,
  faChevronUp,
  faCircleQuestion,
  faCodeBranch,
)

const GITHUB_URL = "https://github.com/decentralized-identity/didcomm-demo"


interface NavbarAttributes {
  profileName: string
  did?: string
  isConnected: boolean
  toggleConnection: () => void
  onProfileNameChange: (newName: string) => void
}

export default class Navbar implements m.ClassComponent<NavbarAttributes> {
  private burgerActive: boolean = false
  private editMode: boolean = false
  private editedProfileName: string = ""
  private didCopied: boolean = false
  private showHelp: boolean = false

  private showToast(message: string, duration: number = 2000) {
    // Create a div element for the toast
    const toast = document.createElement("div")
    toast.className = "toast"
    toast.textContent = message

    // Append it to the body
    document.body.appendChild(toast)

    // Force a reflow to trigger the transition
    void toast.offsetWidth

    // Show the toast
    toast.classList.add("show")

    // Remove the toast after the specified duration
    setTimeout(() => {
      toast.classList.remove("show")

      // Wait for the transition to finish before removing the element
      toast.addEventListener("transitionend", () => {
        document.body.removeChild(toast)
      })
    }, duration)
  }

  private copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.didCopied = true
        m.redraw() // Inform Mithril to redraw the component

        // Reset after some time (e.g., 2 seconds)
        setTimeout(() => {
          this.didCopied = false
          m.redraw()
        }, 2000)

        // Show the toast
        // Assuming you have a toast library/method named `showToast`
        this.showToast("Copied!")
      })
      .catch(err => {
        console.error("Failed to copy text: ", err)
      })
  }

  refreshMessages() {
    agent.refreshMessages()
  }

  rotateDid() {
    agent.rotateDid()
  }


  view(vnode: m.Vnode<NavbarAttributes>) {
    const {
      profileName,
      isConnected,
      did,
      toggleConnection,
      onProfileNameChange,
    } = vnode.attrs
    const truncatedDid = did && did.length > 20 ? `${did.slice(0, 20)}...` : did

    return m(".navbar", [
      m(".navbar-brand", { style: { display: "flex", alignItems: "center" } }, [
        this.editMode
          ? m("input.title", {
              value: this.editedProfileName,
              oninput: (e: Event) =>
                (this.editedProfileName = (e.target as HTMLInputElement).value),
              onblur: (e: Event) => {
                e.preventDefault()
                onProfileNameChange(this.editedProfileName)
                this.editMode = false
              },
              style: {
                border: "none",
                background: "transparent",
                outline: "none",
                paddingLeft: "12px",
              },
              oncreate: (vnode: m.VnodeDOM) => {
                const input = vnode.dom as HTMLInputElement
                input.focus()
                input.setSelectionRange(
                  this.editedProfileName.length,
                  this.editedProfileName.length
                )
              },
              onkeydown: (e: KeyboardEvent) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  // Onblur covers this, so we don't need to send another message
                  //await onProfileNameChange(this.editedProfileName)
                  onProfileNameChange(this.editedProfileName)
                  this.editMode = false
                }
              },
            })
          : m(
              "span.navbar-item",
              { style: { display: "flex", alignItems: "center" } },
              [
                m(
                  "h1.title",
                  { style: { marginBottom: "0", marginRight: ".5em" } },
                  profileName
                ),
                m(
                  "button.button.is-white.is-small",
                  {
                    onclick: () => {
                      this.editMode = true
                      this.editedProfileName = profileName
                    },
                    style: { marginRight: ".5em" },
                  },
                  [m("span.icon", [m("i.fas.fa-edit")])]
                ),
                truncatedDid &&
                  m(
                    "span",
                    { style: { marginRight: ".5em" } },
                    `(${truncatedDid})`
                  ),
                did && m(
                  "button.button.is-white.navbar-item",
                  {
                    onclick: () => {
                      this.rotateDid()
                    },
                    style: { marginRight: ".5em" },
                    title: "Rotate DID",
                  },
                  [m("span.icon", [m("i.fas.fa-refresh")])]
                ),
                did &&
                  m(
                    "button.button.is-small.is-white",
                    {
                      onclick: () => this.copyToClipboard(did),
                      class: this.didCopied ? "is-success" : "",
                      title: "Copy DID to clipboard",
                    },
                    m(
                      "span.icon",
                      m("i", {
                        class: this.didCopied
                          ? "fa-solid fa-check"
                          : "fa-solid fa-copy",
                      })
                    )
                  ),
                m(
                  "button#menu-expand.button.is-small.is-white",
                  {
                    onclick: () => {
                      this.burgerActive = !this.burgerActive
                    },
                  },
                  m(
                    "span.icon",
                    m("i", {
                      class: this.burgerActive
                        ? "fa-solid fa-chevron-up"
                        : "fa-solid fa-chevron-down",
                    })
                  )
                ),
              ]
            ),
      ]),
      m(HelpModal, {
        isActive: this.showHelp,
        onClose: () => this.showHelp = false,
      }),
      m(".navbar-menu", { class: this.burgerActive ? "is-active" : "" }, [
        m(".navbar-end", { style: { display: "flex", alignItems: "center" } }, [
          m(
            "a.is-white.navbar-item",
            {
              href: GITHUB_URL,
              target: "_blank",
              title: "Check out the source on Github.", // Hover text
            },
            [
              m("span.icon", [m("i.fas.fa-code-branch")]),
              m("span", "Github")
            ]
          ),
          m(
            "button.button.is-white.navbar-item",
            {
              onclick: () => this.showHelp = true,
              title: "What's going on here?", // Hover text
            },
            [
              m("span.icon", [m("i.fas.fa-circle-question")]),
              m("span", "Help")
            ]
          ),
          m(
            "button.button.is-white.navbar-item",
            {
              onclick: () => {
                this.refreshMessages()
              },
              style: { marginRight: ".5em" },
              title: "Retrieve messages",
            },
            [m("span.icon", [m("i.fas.fa-refresh")])]
          ),
          m(
            "button.button.is-white.navbar-item",
            {
              onclick: toggleConnection,
              title: "Click to " + (isConnected ? "disconnect" : "connect"), // Hover text
            },
            [
              m(Icon, {
                class: isConnected
                  ? "fa-solid fa-circle"
                  : "fa-regular fa-circle",
              }), // circle icons
              m("span", isConnected ? "WS Connected" : "WS Disconnected"),
            ]
          ),
        ]),
      ]),
    ])
  }
}
