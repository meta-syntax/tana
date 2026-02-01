export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange'
    },
    input: {
      slots: {
        root: 'w-full',
        base: 'w-full bg-white text-[#111] placeholder:text-gray-400'
      }
    },
    button: {
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'text-[#111] hover:bg-primary/80 active:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        },
        {
          color: 'primary',
          variant: 'ghost',
          class: 'text-gray-600 hover:text-[#111] hover:bg-primary/10 active:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        }
      ]
    }
  }
})
