class UsersController < ApplicationController

  def index
    users=User.all
    render json: UserSerializer.new(users).to_serialized_json
  end

  def create
    user=User.find_or_create_by(username: params[:username])
    render json: UserSerializer.new(user).to_serialized_json
  end

  def show
    user=User.find(params[:id])
    render json: UserSerializer.new(user).to_serialized_json
  end

  def update_cash
    user=User.find_or_create_by(username: params[:username])
    multiplier = params[:direction]=="deposit" ? 1 : -1
    user.cash_balance+=multiplier*params[:amount].to_f
    user.save
    render json: UserSerializer.new(user).to_serialized_json
  end

end
