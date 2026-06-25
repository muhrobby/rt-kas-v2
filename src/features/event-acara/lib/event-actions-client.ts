import {
  createEventAction,
  updateEventAction,
  transitionEventStatusAction,
} from "@/lib/actions/event"
import type { CreateEventInput, UpdateEventInput, TransitionStatusInput } from "@/lib/validations/event"

export async function submitCreateEvent(input: CreateEventInput) {
  return createEventAction(input)
}

export async function submitUpdateEvent(input: UpdateEventInput) {
  return updateEventAction(input)
}

export async function submitTransitionStatus(input: TransitionStatusInput) {
  return transitionEventStatusAction(input)
}
