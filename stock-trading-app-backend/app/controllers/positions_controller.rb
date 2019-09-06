class PositionsController < ApplicationController
  def index
    positions=Position.all
    render json: PositionSerializer.new(positions).to_serialized_json
  end

  def create
  end

  def show
    user=User.find_by(username: params[:username]) #imagine getting a fetch request from JS with username as the params
    positions=Position.where(user_id: user.id)
    render json: PositionSerializer.new(positions).to_serialized_json
  end

end
