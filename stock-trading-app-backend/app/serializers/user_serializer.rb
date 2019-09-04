class UserSerializer
  # include FastJsonapi::ObjectSerializer
  # attributes
  def initialize(user)
    @user=user
  end

  def to_serialized_json
    # options={
    #   include: {
    #     trainer:{
    #       only: [:name]
    #     }
    #   }
    # }
    @user.to_json(options)
  end

end
