class PositionsController < ApplicationController
  def index
    user=User.find_by(username: params[:username]) #imagine getting a fetch request from JS with username as the params
    positions=Position.where(user_id: user.id)
    render json: PositionSerializer.new(positions).to_serialized_json
  end

  def create
  end

  def show
    user=User.find_by(username: params[:username]) #imagine getting a fetch request from JS with username as the params
    stock=Stock.find_by(ticker:params[:ticker]) #imagine getting a fetch request from JS containing ticker in params
    position=Position.find_by(stock_id: stock.id, user_id: user.id)
    position.update_unrealized(params[:price].to_f)
    render json: PositionSerializer.new(position).to_serialized_json
  end

end
