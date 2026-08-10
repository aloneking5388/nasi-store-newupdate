import { Input } from "../ui/input";
import { Label } from "../ui/label";


interface FormInputProps {
  label: string;
  id?: string;
  [key: string]: any;
}

const FormInput = ({ label, ...props }: FormInputProps) => (
    <div className="flex flex-col w-full gap-1">
      <Label htmlFor={props.id}>{label}</Label>
      <Input
        className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]"
        {...props}
      />
    </div>
  );

export default FormInput;