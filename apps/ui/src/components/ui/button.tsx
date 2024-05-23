import { ark } from '@ark-ui/react/factory'
import type { ComponentProps } from 'react'
import { styled } from '@/styled-system/jsx'
import { button } from '@/styled-system/recipes'

//  https://codesandbox.io/p/devbox/park-ui-examples-react-next-js-gqtr26?file=%2Fsrc%2Fapp%2Fpage.tsx

// @ts-ignore
export const Button = styled(ark.button, button)
export interface ButtonProps extends ComponentProps<typeof Button> {}


