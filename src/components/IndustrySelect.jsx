import React, { useEffect, useState } from 'react';
import { Select, Space } from 'antd';
import { industryList } from '../controllers/front/commonController';

const IndustrySelect = ({ setIndustryValue, selectedOption = [] }) => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(selectedOption || []);

  const handleChange = (value) => {
    setSelected(value);
    setIndustryValue(value);
  };

  const getIndustryList = async () => {
    try {
      const res = await industryList({ condition: { status: "A" } });
      if (res?.status && res?.result?.length > 0) {
        const formatData = res.result.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setOptions(formatData);
      }
    } catch (error) {
      console.error("Error fetching industries:", error);
    }
  };

  useEffect(() => {
    getIndustryList();
  }, []);

  useEffect(() => {
    setSelected(selectedOption || []);
  }, [selectedOption]);

  return (
    <Select
      mode="multiple"
      style={{ width: "100%" }}
      placeholder="Select industry"
      value={selected || []}
      onChange={handleChange}
      options={options}
      optionRender={(option) => (
        <Space>
          <span>{option?.label}</span>
        </Space>
      )}
      getPopupContainer={triggerNode => document.body}
      dropdownStyle={{ zIndex: 1300 }}
    />
  );
};

export default IndustrySelect;
