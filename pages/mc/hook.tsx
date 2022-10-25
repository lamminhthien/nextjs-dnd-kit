import {UniqueIdentifier} from '@dnd-kit/core';
import {AnimateLayoutChanges, defaultAnimateLayoutChanges} from '@dnd-kit/sortable';
export const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';
export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

const animateLayoutChanges: AnimateLayoutChanges = args => defaultAnimateLayoutChanges({...args, wasDragging: true});
const empty: UniqueIdentifier[] = [];

export default function useMCHook() {
  return {TRASH_ID, PLACEHOLDER_ID, animateLayoutChanges, empty};
}
