export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange'
    },
    input: {
      slots: {
        root: 'w-full',
        base: 'w-full placeholder:text-gray-400 selection:bg-orange-200 dark:selection:bg-orange-900'
      },
      variants: {
        size: {
          lg: {
            base: 'px-3 py-2 text-base gap-2'
          }
        }
      }
    },
    textarea: {
      slots: {
        root: 'w-full',
        base: 'w-full placeholder:text-gray-400 selection:bg-orange-200 dark:selection:bg-orange-900'
      },
      variants: {
        size: {
          lg: {
            base: 'px-3 py-2 text-base gap-2'
          }
        }
      }
    },
    button: {
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'hover:bg-primary/80 active:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        },
        {
          color: 'primary',
          variant: 'ghost',
          class: 'hover:bg-primary/10 active:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        }
      ]
    }
  }
})
