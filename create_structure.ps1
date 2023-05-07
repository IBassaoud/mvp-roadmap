# Core module and services
ng g module core
ng g service core/services/firebase

# Shared module and components
ng g module shared
ng g component shared/components/app-header --export
ng g component shared/components/app-footer --export

# Pages module, Landing and Board components
ng g module pages
ng g component pages/landing
ng g component pages/board

# Create global styles files
New-Item -ItemType File -Path src/styles/_variables.scss
New-Item -ItemType File -Path src/styles/_mixins.scss
