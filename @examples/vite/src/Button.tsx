import {styles} from '@examples/shared/button'
import {useStyles} from '@toned/react/index'

export function Button({label}: {label: string}) {
  const s = useStyles(styles, {
    size: 'm',
    variant: 'accent',
  })

  return (
    <button type="button" {...s.container}>
      <span {...s.label}>{label}</span>
    </button>
  )
}
