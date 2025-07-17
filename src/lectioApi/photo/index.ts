import { Configuration } from "../../functions/config"
import { getClient } from "../client"

const url = (schoolId: number) => `https://www.lectio.dk/lectio/${schoolId}/api/photo/v1`

/** UpdatePhotoByCpr */
export interface UpdatePhotoByCpr {
  /** xs:string */
  cprNumber: string;
  /** xs:base64Binary */
  imageJpeg: string;
}

export interface UpdatePhotoByCprAsync extends UpdatePhotoByCpr {
  config: Configuration
}

/** UpdatePhotoByCprResponse */
export interface UpdatePhotoByCprResponse {
}

export const UpdatePhotoByCprAsync = async ({ config, cprNumber, imageJpeg }: UpdatePhotoByCprAsync): Promise<UpdatePhotoByCprResponse> => {
  const client = await getClient(url(config.schoolId), config)
  return await client.UpdatePhotoByCprAsync({ cprNumber, imageJpeg })
}


/** GetPhotoByCpr */
export interface GetPhotoByCpr {
  /** xs:string */
  cprNumber: string;
}

export interface GetPhotoByCprAsync extends GetPhotoByCpr {
  config: Configuration
}

/** GetPhotoByCprResponse */
export interface GetPhotoByCprResponse {
  /** xs:base64Binary */
  GetPhotoByCprResult?: string;
}

export const GetPhotoByCprAsync = async ({ config, cprNumber }: GetPhotoByCprAsync): Promise<GetPhotoByCprResponse> => {
  const client = await getClient(url(config.schoolId), config)
  return await client.GetPhotoByCprAsync({ cprNumber })
}