"use client"

// Adapted from https://ui.shadcn.com/docs/components/toast
import { useEffect, useState } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toasts = []

const listeners = []

function addToRemoveQueue(toastId) {
  if (toasts.length >= TOAST_LIMIT) {
    toasts.shift()
  }

  const timeout = setTimeout(() => {
    listeners.forEach((listener) => {
      listener({
        type: "REMOVE_TOAST",
        toastId,
      })
    })
  }, TOAST_REMOVE_DELAY)

  return timeout
}

export function toast(props) {
  const id = genId()

  const update = (props) => {
    listeners.forEach((listener) => {
      listener({
        type: "UPDATE_TOAST",
        toast: { ...props, id },
      })
    })
  }

  const dismiss = () => {
    listeners.forEach((listener) => {
      listener({
        type: "DISMISS_TOAST",
        toastId: id,
      })
    })
  }

  listeners.forEach((listener) => {
    listener({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss()
        },
      },
    })
  })

  return {
    id,
    dismiss,
    update,
  }
}

export function useToast() {
  const [state, setState] = useState({
    toasts: [],
  })

  useEffect(() => {
    listeners.push(setState)

    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId) => {
      listeners.forEach((listener) => {
        listener({
          type: "DISMISS_TOAST",
          toastId,
        })
      })
    },
  }
}
