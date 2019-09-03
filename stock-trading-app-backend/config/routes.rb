Rails.application.routes.draw do
  resources :stocks
  resources :positions
  resources :trades
  resources :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
