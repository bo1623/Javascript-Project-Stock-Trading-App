Rails.application.routes.draw do
  resources :stocks
  resources :positions
  resources :trades
  resources :users

  post '/positions/update', to: 'positions#updateprice'
  post 'users/update', to: 'users#update_cash'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
