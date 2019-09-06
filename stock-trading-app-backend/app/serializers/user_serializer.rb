class UserSerializer
  # include FastJsonapi::ObjectSerializer
  # attributes
  def initialize(user)
    @user=user
  end

  def to_serialized_json
    options={
      include: {
        trades:{
          only: [:stock_id,:user_id,:price,:direction,:quantity]
        },
        positions:{
          only: [:size,:stock_id,:user_id,:cost,:value,:realized,:unrealized]
        }
      }
    }
    @user.to_json(options)
  end

end
