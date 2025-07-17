import { Configuration } from "../../functions/config"
import { getClient } from "../client"

export const SayHelloAsync = async (config: Configuration) => {
  const client = await getClient(`https://www.lectio.dk/lectio/${config.schoolId}/api/hello/v1`, config)
  return await client.SayHelloAsync({ name: config.schoolName })
}