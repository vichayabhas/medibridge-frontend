"use client";

import React from "react";
import {
  AuthUser,
  BloodType,
  bloodTypes,
  Gender,
  genders,
  PatientProfileType,
} from "../../../interface";
import { Input } from "../ui/input";
import {
  addItemInUseStateArray,
  copy,
  modifyElementInUseStateArray,
  removeItem,
  setBoolean,
  setMap,
  setTextToFloat,
  setTextToString,
} from "../utility/setup";
import { Checkbox, MenuItem, Select } from "@mui/material";
import { Button } from "../ui/button";
import createOrUpdatePatientProfile from "@/libs/user/createOrUpdatePatientProfile";
export interface CreateOrUpdatePatientProfile {
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  weight: number;
  allergies: string[];
  conditions: string[];
  currentMedications: string[];
  isPregnant: boolean;
  isBreastfeeding: boolean;
  bloodType: string;
  symptoms: string;
}

export default function PatientRegisterPage({
  token,
  user,
  patientProfile,
  setPatientProfile,
}: {
  token: string;
  user: AuthUser;
  patientProfile: PatientProfileType | null;
  setPatientProfile: React.Dispatch<
    React.SetStateAction<PatientProfileType | null>
  >;
}) {
  //   firstName: string;
  const [firstName, setFirstName] = React.useState(
    patientProfile ? patientProfile.firstName : user.name.split(" ")[0],
  );

  //   lastName: string;
  const [lastName, setLastName] = React.useState(
    patientProfile ? patientProfile.lastName : user.name.split(" ")[1],
  );

  //   gender: Gender;
  const [gender, setGender] = React.useState<Gender>(
    patientProfile ? patientProfile.gender : "other",
  );

  //   age: number;
  const [age, setAge] = React.useState(patientProfile ? patientProfile.age : 0);

  //   weight: number;
  const [weight, setWeight] = React.useState(
    patientProfile ? patientProfile.weight : 0,
  );

  //   allergies: string[];
  const [allergies, setAllergies] = React.useState(
    patientProfile ? patientProfile.allergies : [],
  );

  //   conditions: string[];
  const [conditions, setConditions] = React.useState(
    patientProfile ? patientProfile.conditions : [],
  );

  //   currentMedications: string[];
  const [currentMedications, setCurrentMedications] = React.useState(
    patientProfile ? patientProfile.currentMedications : [],
  );

  //   isPregnant: boolean;
  const [isPregnant, setIsPregnant] = React.useState(
    patientProfile ? patientProfile.isPregnant : false,
  );

  //   isBreastfeeding: boolean;
  const [isBreastfeeding, setIsBreastfeeding] = React.useState(
    patientProfile ? patientProfile.isBreastfeeding : false,
  );

  //   bloodType: string;
  const [bloodType, setBloodType] = React.useState<BloodType>(
    patientProfile ? patientProfile.bloodType : "O",
  );

  //   symptoms: string;
  const [symptoms, setSymptoms] = React.useState(
    patientProfile ? patientProfile.symptoms : "-",
  );
  return (
    <>
      <div>
        ชื่อจริง
        <Input
          onChange={setTextToString(setFirstName, true)}
          value={firstName}
        />
      </div>
      <div>
        นามสกุล
        <Input onChange={setTextToString(setLastName, true)} value={lastName} />
      </div>
      <div>
        เพศ
        <Select value={gender} renderValue={copy}>
          {genders.map((v, i) => (
            <MenuItem
              key={i}
              onClick={() => {
                setGender(v);
              }}
            >
              {v}
            </MenuItem>
          ))}
        </Select>
      </div>

      <div>
        อายุ
        <Input
          onChange={setTextToFloat(setAge)}
          value={age.toString()}
          type="number"
        />
      </div>
      <div>
        น้ำหนัก
        <Input
          onChange={setTextToFloat(setWeight)}
          value={weight.toString()}
          type="number"
        />
      </div>
      <div>
        <div>การแพ้</div>
        {allergies.map((allergy, i) => (
          <div key={i}>
            <Input
              value={allergy}
              onChange={setTextToString(
                setMap(setAllergies, modifyElementInUseStateArray(i)),
              )}
            />
            <Button
              onClick={() => {
                removeItem(i, setAllergies);
              }}
            />
          </div>
        ))}
        <div>
          <Button
            onClick={() => {
              setAllergies(addItemInUseStateArray(""));
            }}
          >
            เพิ่ม
          </Button>
        </div>
      </div>
      <div>
        <div>เงื่อนไข</div>
        {conditions.map((condition, i) => (
          <div key={i}>
            <Input
              value={condition}
              onChange={setTextToString(
                setMap(setConditions, modifyElementInUseStateArray(i)),
              )}
            />
            <Button
              onClick={() => {
                removeItem(i, setConditions);
              }}
            />
          </div>
        ))}
        <div>
          <Button
            onClick={() => {
              setConditions(addItemInUseStateArray(""));
            }}
          >
            เพิ่ม
          </Button>
        </div>
      </div>

      <div>
        ยาปัจุบัน
        {currentMedications.map((medication, i) => (
          <div key={i}>
            <Input
              value={medication}
              onChange={setTextToString(
                setMap(setCurrentMedications, modifyElementInUseStateArray(i)),
              )}
            />
            <Button
              onClick={() => {
                removeItem(i, setCurrentMedications);
              }}
            />
          </div>
        ))}
        <div>
          <Button
            onClick={() => {
              setCurrentMedications(addItemInUseStateArray(""));
            }}
          >
            เพิ่ม
          </Button>
        </div>
      </div>
      <div>
        ท้องอยู่หรือไม่
        <Checkbox onChange={setBoolean(setIsPregnant)} checked={isPregnant} />
      </div>
      <div>
        ให้นมบุตรหรือไม่
        <Checkbox
          onChange={setBoolean(setIsBreastfeeding)}
          checked={isBreastfeeding}
        />
      </div>
      <div>
        กรุ๊ปเลือด
        <Select value={bloodType} renderValue={copy}>
          {bloodTypes.map((v, i) => (
            <MenuItem
              key={i}
              onClick={() => {
                setBloodType(v);
              }}
            >
              {v}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div>
        อาการ
        <Input value={symptoms} onChange={setTextToString(setSymptoms, true)} />
      </div>
      <Button
        onClick={async () => {
          const newPatientProfile = await createOrUpdatePatientProfile(
            {
              firstName,
              lastName,
              age,
              allergies,
              conditions,
              currentMedications,
              bloodType,
              isBreastfeeding,
              isPregnant,
              weight,
              gender,
              symptoms,
            },
            token,
          );
          setPatientProfile(newPatientProfile);
        }}
      ></Button>
    </>
  );
}
