import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, trim: true }) name!: string;

  @Prop({ required: true, unique: true, trim: true }) email!: string;

  @Prop({ required: true }) password!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
