class UsersController < ApplicationController

  def index
  end

  def create
    user=User.create(params[:username])
  end

end
